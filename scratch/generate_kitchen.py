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

mat_cab    = mat("Cabinet",    "#f0ece4", roughness=0.70)
mat_door   = mat("Door",       "#e8e2d8", roughness=0.60)
mat_cntop  = mat("Countertop", "#3a3530", roughness=0.25, metalness=0.10)
mat_handle = mat("Handle",     "#b8b8b8", roughness=0.10, metalness=0.95)
mat_sink   = mat("Sink",       "#d0d4d8", roughness=0.15, metalness=0.80)
mat_tap    = mat("Tap",        "#c8c8c8", roughness=0.08, metalness=0.95)
mat_wall   = mat("Wall",       "#f5f2ee", roughness=0.90)

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
    import math
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, 0, 0))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

# Layout: 4-unit base run (left wall) + 2-unit upper run
unit_w = 0.60
n_lower = 4
n_upper = 3
cab_h_lower = 0.85
cab_h_upper = 0.72
cab_d_lower = 0.58
cab_d_upper = 0.32
wall_offset = -0.30  # back wall z position
counter_overhang = 0.03
T = 0.018

total_w = unit_w * n_lower

# Lower cabinets
for i in range(n_lower):
    cx = -total_w/2 + unit_w * i + unit_w/2
    box(f"LowerCab{i}", unit_w - 0.002, cab_h_lower, cab_d_lower,
        cx, wall_offset + cab_d_lower/2, cab_h_lower/2, mat_cab)
    # Door
    box(f"LowerDoor{i}", unit_w - 0.014, cab_h_lower - 0.10, 0.016,
        cx, wall_offset + cab_d_lower + 0.008, 0.06 + (cab_h_lower - 0.10)/2, mat_door)
    # Handle
    cyl(f"LowerHandle{i}", 0.006, 0.20,
        cx, wall_offset + cab_d_lower + 0.020, 0.06 + (cab_h_lower - 0.10) * 0.38,
        1.5708, mat_handle)

# Countertop slab
box("Countertop", total_w + 0.04, 0.04, cab_d_lower + counter_overhang,
    0, wall_offset + (cab_d_lower + counter_overhang)/2 - counter_overhang/2,
    cab_h_lower + 0.02, mat_cntop)

# Sink basin
box("SinkBasin", unit_w * 0.72, 0.14, cab_d_lower * 0.60,
    unit_w * 0.5, wall_offset + cab_d_lower * 0.46,
    cab_h_lower + 0.04 - 0.14/2 + 0.02, mat_sink)

# Tap
cyl("TapBase", 0.018, 0.22, unit_w * 0.5, wall_offset + cab_d_lower * 0.20,
    cab_h_lower + 0.04 + 0.11, 0, mat_tap)

# Splashback
box("Splashback", total_w, cab_h_upper + 0.25, 0.010,
    0, wall_offset, cab_h_lower + 0.04 + (cab_h_upper + 0.25)/2, mat_wall)

# Upper cabinets (3 units centered)
upper_total = unit_w * n_upper
upper_base_z = cab_h_lower + 0.04 + 0.30
for i in range(n_upper):
    cx = -upper_total/2 + unit_w * i + unit_w/2
    box(f"UpperCab{i}", unit_w - 0.002, cab_h_upper, cab_d_upper,
        cx, wall_offset + cab_d_upper/2, upper_base_z + cab_h_upper/2, mat_cab)
    box(f"UpperDoor{i}", unit_w - 0.014, cab_h_upper - 0.04, 0.016,
        cx, wall_offset + cab_d_upper + 0.008, upper_base_z + 0.02 + (cab_h_upper - 0.04)/2, mat_door)
    cyl(f"UpperHandle{i}", 0.005, 0.18,
        cx, wall_offset + cab_d_upper + 0.020, upper_base_z + 0.02 + (cab_h_upper - 0.04) * 0.65,
        1.5708, mat_handle)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Kitchen"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\kitchen.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
