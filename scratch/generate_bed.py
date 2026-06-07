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

mat_frame    = mat("Frame",     "#8a6848", roughness=0.72)   # mid walnut
mat_headboard= mat("Headboard", "#6a4030", roughness=0.80)   # dark padded
mat_mattress = mat("Mattress",  "#f2efe9", roughness=0.88)
mat_pillow   = mat("Pillow",    "#ffffff", roughness=0.92)
mat_sheet    = mat("Sheet",     "#e8e4dc", roughness=0.85)
mat_leg      = mat("Leg",       "#705038", roughness=0.68)
mat_led      = mat("LED",       "#88aaff", roughness=0.4, metalness=0.0)
mat_nightstd = mat("Nightstand","#9a7858", roughness=0.70)
mat_lamp     = mat("Lamp",      "#f0d890", roughness=0.3, metalness=0.1)

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
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

def sphere(name, r, x, y, z, m):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(x, y, z), segments=10, ring_count=8)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(obj)
    return obj

# Queen size
W, L = 1.65, 2.10
frame_h = 0.28
matt_h  = 0.24
leg_h   = 0.12

# Platform base
box("PlatformBase", W, frame_h, L, 0, 0, leg_h + frame_h/2, mat_frame)

# 4 legs
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    box(f"Leg{sx}{sz}", 0.10, leg_h, 0.10,
        sx * (W/2 - 0.08), sz * (L/2 - 0.10), leg_h/2, mat_leg)

# Mattress
box("Mattress", W - 0.04, matt_h, L - 0.06,
    0, 0, leg_h + frame_h + matt_h/2, mat_mattress)

# Sheet drape (slightly smaller, with fold-back look)
sheet_z = leg_h + frame_h + matt_h
box("Sheet", W - 0.04, 0.018, L * 0.60,
    0, L * 0.20, sheet_z + 0.009, mat_sheet)

# Pillows (2)
for sx in [-1, 1]:
    box(f"Pillow{sx}", W * 0.38, 0.12, 0.48,
        sx * W * 0.22, -L/2 + 0.34, sheet_z + 0.07, mat_pillow)
    # Slight puff on top
    sphere(f"PillowPuff{sx}", 0.09,
        sx * W * 0.22, -L/2 + 0.34, sheet_z + 0.14, mat_pillow)

# Headboard (padded, tall with vertical stitching channels)
hb_h = 1.00
hb_t = 0.10
box("Headboard", W + 0.06, hb_h, hb_t,
    0, -L/2 - hb_t/2, leg_h + frame_h + hb_h/2, mat_headboard)
# Stitching channels (thin vertical strips)
for si in range(-2, 3):
    box(f"Stitch{si}", 0.008, hb_h - 0.06, 0.004,
        si * (W / 5.5), -L/2 - hb_t + 0.002, leg_h + frame_h + hb_h/2, mat_frame)

# Footboard (low)
box("Footboard", W + 0.06, 0.35, 0.08,
    0, L/2 + 0.04, leg_h + frame_h + 0.175, mat_frame)

# Under-bed LED strip
box("LEDStrip", W - 0.06, 0.010, L - 0.06,
    0, 0, leg_h - 0.005, mat_led)

# ── Nightstands (both sides) ───────────────────────────────────────
for sx in [-1, 1]:
    nsx = sx * (W/2 + 0.28)
    # Body
    box(f"Nightstand{sx}", 0.48, 0.50, 0.40,
        nsx, -L/4, leg_h + 0.25, mat_nightstd)
    # Drawer face
    box(f"NSDrawer{sx}", 0.42, 0.22, 0.014,
        nsx, -L/4 + 0.20 + 0.007, leg_h + 0.14, mat_frame)
    cyl(f"NSHandle{sx}", 0.006, 0.08, nsx, -L/4 + 0.20 + 0.018, leg_h + 0.14, 1.5708, mat_led)
    # Lamp (simple)
    cyl(f"LampBase{sx}", 0.06, 0.04, nsx, -L/4, leg_h + 0.50 + 0.02, 0, mat_lamp)
    cyl(f"LampPole{sx}", 0.014, 0.36, nsx, -L/4, leg_h + 0.50 + 0.04 + 0.18, 0, mat_frame)
    sphere(f"LampShade{sx}", 0.11, nsx, -L/4, leg_h + 0.50 + 0.04 + 0.36 + 0.09, mat_lamp)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Bed"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\bed.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
