import bpy
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

mat_top    = mat("DeskTop",  "#c8a870", roughness=0.65)   # oak
mat_base   = mat("DeskBase", "#e8e0d4", roughness=0.70)   # beige
mat_leg    = mat("Leg",      "#888888", roughness=0.15, metalness=0.90)
mat_drawer = mat("Drawer",   "#d4c8b0", roughness=0.70)
mat_handle = mat("Handle",   "#b0b0b0", roughness=0.10, metalness=0.90)
mat_screen = mat("Screen",   "#0d1117", roughness=0.05, metalness=0.30)
mat_screen_glow = mat("ScreenGlow", "#1a2a4a", roughness=0.20, metalness=0.10)
mat_chair  = mat("Chair",    "#2a2a2a", roughness=0.80)
mat_shelf  = mat("Shelf",    "#b89050", roughness=0.70)

parts = []

def box(name, w, h, d, x, y, z, m, rx=0, ry=0, rz=0):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z), rotation=(rx, ry, rz))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w, d, h)
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    parts.append(obj)
    return obj

def cyl(name, r, h, x, y, z, rx, m):
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

# ── Desk ──────────────────────────────────────────────────────────
DW, DD, DH, DT = 2.40, 1.0, 0.75, 0.05

# Desk top
box("DeskTop", DW, DT, DD, 0, 0, DH, mat_top)

# 4 legs (tapered metal)
leg_h = DH - DT
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    cyl(f"Leg{sx}{sz}", 0.030, leg_h, sx*(DW/2-0.08), sz*(DD/2-0.08),
        leg_h/2, 0, mat_leg)

# Drawer unit (right side, floor-standing)
DRW, DRH, DRD = 0.45, DH - DT, 0.50
drx = DW/2 - DRW/2
box("DrawerUnit", DRW, DRH, DRD, drx, 0, DRH/2, mat_base)
drawer_count = 4
for i in range(drawer_count):
    dz = (i + 0.5) * (DRH / drawer_count)
    box(f"DrawerFace{i}", DRW - 0.018, DRH/drawer_count - 0.010, 0.012,
        drx, DRD/2 + 0.006, dz, mat_drawer)
    cyl(f"DHandle{i}", 0.006, 0.10, drx, DRD/2 + 0.018, dz, 1.5708, mat_handle)

# ── Monitor ────────────────────────────────────────────────────────
mon_cx = -DW/4
mon_cz = DH + 0.28
# Stand base
box("MonStandBase", 0.24, 0.012, 0.18, mon_cx, -DD/4, DH + 0.006, mat_leg)
# Stand pole
box("MonStandPole", 0.025, 0.30, 0.025, mon_cx, -DD/4 + 0.02, DH + 0.006 + 0.15, mat_leg)
# Screen
box("Screen", 0.70, 0.40, 0.018, mon_cx, -DD/4 + 0.025, mon_cz, mat_screen)
# Screen face (slight glow)
box("ScreenFace", 0.66, 0.36, 0.002, mon_cx, -DD/4 + 0.034, mon_cz, mat_screen_glow)

# ── Wall shelving unit (behind desk) ───────────────────────────────
SW, SH, SD = 1.60, 2.2, 0.30
sx_wall = -DW/2 - SD/2 - 0.05
T = 0.020
box("ShelfSideL", T, SH, SD, sx_wall - SW/2 + T/2, 0, SH/2, mat_shelf)
box("ShelfSideR", T, SH, SD, sx_wall + SW/2 - T/2, 0, SH/2, mat_shelf)
box("ShelfTop",   SW, T, SD, sx_wall, 0, SH - T/2,           mat_shelf)
box("ShelfBottom",SW, T, SD, sx_wall, 0, T/2,                mat_shelf)
for i in range(4):
    sy = T + (i+1) * (SH - T*2) / 5
    box(f"Shelf{i}", SW - T*2, T*0.85, SD - 0.01, sx_wall, 0, sy, mat_shelf)

# ── Chair (simple ergonomic silhouette) ───────────────────────────
chx = 0
chz_base = 0
# Base star + wheels (simplified disc)
cyl("ChairBase", 0.32, 0.04, chx, DD/2 + 0.30, 0.04, 0, mat_leg)
# Pole
cyl("ChairPole", 0.03, 0.44, chx, DD/2 + 0.30, 0.26, 0, mat_leg)
# Seat
box("ChairSeat", 0.52, 0.06, 0.52, chx, DD/2 + 0.30, 0.50, mat_chair)
# Back
box("ChairBack", 0.50, 0.68, 0.06, chx, DD/2 + 0.04, 0.50 + 0.06/2 + 0.34, mat_chair)
# Armrests
for sx in [-1, 1]:
    box(f"Armrest{sx}", 0.04, 0.04, 0.30, sx * 0.27, DD/2 + 0.30 + 0.26, 0.50 + 0.10, mat_chair)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Office"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\office.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
