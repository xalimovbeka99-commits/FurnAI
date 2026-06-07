import bpy
import math
import os

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, hex_color, roughness=0.5, metalness=0.0):
    m = bpy.data.materials.new(name=name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    h = hex_color.lstrip('#')
    rgba = [int(h[i:i+2], 16)/255.0 for i in (0, 2, 4)] + [1.0]
    bsdf.inputs['Base Color'].default_value = rgba
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metalness
    return m

mat_body   = mat("Body",   "#e8dece", roughness=0.68)   # light oak
mat_drawer = mat("Drawer", "#ddd0bc", roughness=0.62)
mat_leg    = mat("Leg",    "#b09060", roughness=0.65)
mat_handle = mat("Handle", "#d4a840", roughness=0.10, metalness=0.90)
mat_mirror = mat("Mirror", "#c8dce8", roughness=0.04, metalness=0.85)
mat_frame  = mat("Frame",  "#c8a050", roughness=0.12, metalness=0.80)
mat_stool  = mat("Stool",  "#c8b4a0", roughness=0.78)
mat_cushion= mat("Cushion","#e8d4c4", roughness=0.88)
mat_led    = mat("LED",    "#fff4cc", roughness=0.3, metalness=0.0)

parts = []

def box(name, w, h, d, x, y, z, m):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w, d, h)
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(obj)
    return obj

def cyl(name, r, h, x, y, z, rx, ry, rz, m):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, ry, rz))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

W, H, D = 1.20, 0.76, 0.50
T = 0.020
leg_h = 0.10

# ── Vanity Table ──────────────────────────────────────────────────
# 4 slender legs
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    box(f"Leg{sx}{sz}", T*1.5, leg_h, T*1.5,
        sx*(W/2 - 0.06), sz*(D/2 - 0.06), leg_h/2, mat_leg)

# Side drawer towers
tower_w = W * 0.28
tower_h = H - leg_h
center_clear_w = W - tower_w*2 - T*2

for side, sx in [("L", -1), ("R", 1)]:
    cx = sx * (W/2 - tower_w/2)
    box(f"Tower{side}", tower_w, tower_h, D, cx, 0, leg_h + tower_h/2, mat_body)
    # 3 drawers per tower
    for i in range(3):
        dz = leg_h + T + (i + 0.5) * (tower_h - T) / 3
        box(f"Drawer{side}{i}", tower_w - T*2, (tower_h - T)/3 - 0.007, 0.014,
            cx, D/2 + 0.007, dz, mat_drawer)
        cyl(f"Handle{side}{i}", 0.005, 0.08, cx, D/2 + 0.018, dz, 1.5708, 0, 0, mat_handle)

# Tabletop (spans full width)
box("Tabletop", W + 0.03, T*1.5, D + 0.02,
    0, 0, leg_h + tower_h + T*0.75, mat_body)

# Open knee space frame bar
box("KneeBar", center_clear_w, T, T*1.5,
    0, D/2 - T/2, leg_h + T/2, mat_body)

# ── Round mirror with gold frame ──────────────────────────────────
mirror_r   = 0.38
frame_t    = 0.025
mirror_z   = leg_h + tower_h + T*1.5 + mirror_r + 0.06

# Mirror pole from tabletop
cyl("MirrorPole", 0.015, 0.06, 0, 0, leg_h + tower_h + T*1.5 + 0.03, 0, 0, 0, mat_frame)

# Frame ring (fat cylinder)
cyl("MirrorFrame", mirror_r + frame_t, frame_t*2, 0, D*0.08, mirror_z, 1.5708, 0, 0, mat_frame)

# Mirror glass disc
cyl("MirrorGlass", mirror_r, 0.006, 0, D*0.08 + frame_t, mirror_z, 1.5708, 0, 0, mat_mirror)

# Mirror LED strip (thin ring behind frame)
cyl("MirrorLED", mirror_r + frame_t*0.5, 0.010, 0, D*0.08 - frame_t*0.5, mirror_z, 1.5708, 0, 0, mat_led)

# ── Perfume / items on tabletop ───────────────────────────────────
top_z = leg_h + tower_h + T*1.5 + T*0.75
# Small perfume bottles
cyl("Perfume1", 0.030, 0.14, W*0.25, D*0.15, top_z + 0.07, 0, 0, 0, mat_mirror)
cyl("Perfume2", 0.022, 0.10, W*0.35, D*0.15, top_z + 0.05, 0, 0, 0, mat_handle)
box("Tray", 0.28, 0.018, 0.18, W*0.28, D*0.12, top_z + 0.009, mat_frame)

# ── Matching Stool ────────────────────────────────────────────────
stool_x = 0
stool_y = D/2 + 0.44
stool_h = H * 0.62
stool_seat_z = stool_h

# 4 stool legs
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    box(f"StoolLeg{sx}{sz}", T*1.3, stool_h, T*1.3,
        stool_x + sx * 0.16, stool_y + sz * 0.16, stool_h/2, mat_leg)

# Seat
box("StoolSeat", 0.40, T*2, 0.38, stool_x, stool_y, stool_seat_z, mat_stool)
# Cushion
box("StoolCushion", 0.36, 0.06, 0.34, stool_x, stool_y, stool_seat_z + T + 0.03, mat_cushion)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "DressingTable"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\dressing_table.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
