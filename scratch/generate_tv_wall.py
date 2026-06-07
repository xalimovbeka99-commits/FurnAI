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

mat_unit   = mat("Unit",    "#2a2622", roughness=0.72)   # dark walnut
mat_door   = mat("Door",    "#342e28", roughness=0.60)
mat_handle = mat("Handle",  "#c8a040", roughness=0.12, metalness=0.90)
mat_tv     = mat("TV",      "#080a0c", roughness=0.04, metalness=0.40)
mat_screen = mat("Screen",  "#0a0e18", roughness=0.06, metalness=0.10)
mat_shelf  = mat("Shelf",   "#3a3430", roughness=0.65)
mat_led    = mat("LED",     "#4488ff", roughness=0.3, metalness=0.0)
mat_wall   = mat("Wall",    "#1a1a1e", roughness=0.95)

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

def cyl(name, r, h, x, y, z, rx, m):
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

# ── Low TV Console / Media Unit ────────────────────────────────────
UW, UH, UD = 2.20, 0.45, 0.42
wall_y = -0.22

box("Console", UW, UH, UD, 0, wall_y + UD/2, UH/2, mat_unit)

# 4 low legs (tapered)
leg_h = 0.08
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    cyl(f"ConsLeg{sx}{sz}", 0.018, leg_h,
        sx*(UW/2 - 0.10), wall_y + sz*(UD/2 - 0.08), leg_h/2, 0, mat_handle)

# 2 doors (left & right halves)
for sx, i in [(-1, 0), (1, 1)]:
    cx = sx * UW / 4
    box(f"ConsDoor{i}", UW/2 - 0.015, UH - 0.015, 0.016,
        cx, wall_y + UD + 0.008, UH/2, mat_door)
    cyl(f"ConsHandle{i}", 0.007, 0.14,
        cx + sx * UW * 0.11, wall_y + UD + 0.020, UH/2, 1.5708, mat_handle)

# Slim middle drawer
box("ConsDrawer", UW * 0.24, UH * 0.38, 0.016,
    0, wall_y + UD + 0.008, UH * 0.62, mat_door)
cyl("ConsDrawHandle", 0.005, 0.08, 0, wall_y + UD + 0.018, UH * 0.62, 1.5708, mat_handle)

# ── Wall panel behind TV ───────────────────────────────────────────
box("WallPanel", UW * 1.3, 1.90, 0.030,
    0, wall_y - 0.018, UH + 0.95, mat_wall)

# ── TV Screen ─────────────────────────────────────────────────────
TV_W, TV_H, TV_T = 1.30, 0.74, 0.032
tv_z = UH + 0.46
box("TVFrame",  TV_W + 0.04, TV_H + 0.04, TV_T, 0, wall_y, tv_z, mat_tv)
box("TVScreen", TV_W, TV_H, 0.010, 0, wall_y + TV_T/2 + 0.004, tv_z, mat_screen)

# LED backlight strip (thin strip behind TV)
box("LEDStrip", TV_W + 0.08, 0.012, TV_H + 0.08,
    0, wall_y - TV_T/2 - 0.006, tv_z, mat_led)

# ── Floating side shelves ─────────────────────────────────────────
shelf_y = wall_y + 0.18
shelf_h = 0.030
shelf_d = 0.28
for side, sx in [("L", -1), ("R", 1)]:
    shelf_cx = sx * (UW / 2 + 0.30)
    for j in range(3):
        sz = UH + 0.28 + j * 0.48
        box(f"FloatShelf{side}{j}", 0.55, shelf_h, shelf_d,
            shelf_cx, wall_y + shelf_d/2, sz, mat_shelf)
        # Bracket
        box(f"Bracket{side}{j}", 0.015, 0.10, 0.015,
            shelf_cx, wall_y + 0.008, sz - 0.05, mat_handle)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "TVWall"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\tv_wall.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
