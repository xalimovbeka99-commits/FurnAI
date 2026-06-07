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

mat_body   = mat("Body",   "#c8b89a", roughness=0.75)
mat_door   = mat("Door",   "#d6c8b0", roughness=0.65)
mat_plinth = mat("Plinth", "#a08060", roughness=0.80)
mat_handle = mat("Handle", "#c0a050", roughness=0.15, metalness=0.90)
mat_mirror = mat("Mirror", "#dde8f0", roughness=0.05, metalness=0.80)

parts = []

def add(name, w, h, d, x, y, z, m):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w, d, h)
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(obj)
    return obj

def add_cyl(name, r, h, x, y, z, rx, ry, rz, m):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=h, location=(x, y, z), rotation=(rx, ry, rz))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

W, H, D = 2.0, 2.4, 0.60
T = 0.022   # panel thickness
plinth_h = 0.10

# Carcass
add("LeftPanel",   T, H - plinth_h, D, -(W/2 - T/2), 0, plinth_h/2 + (H-plinth_h)/2, mat_body)
add("RightPanel",  T, H - plinth_h, D,  (W/2 - T/2), 0, plinth_h/2 + (H-plinth_h)/2, mat_body)
add("TopPanel",    W, T, D,           0, 0, H - T/2,              mat_body)
add("BackPanel",   W - T*2, H - plinth_h - T, 0.012, 0, -(D/2 - 0.006), plinth_h + T/2 + (H - plinth_h - T)/2, mat_plinth)
add("BottomShelf", W - T*2, T, D - 0.01, 0, 0, plinth_h + T/2,  mat_body)

# Mid shelf
add("MidShelf", W - T*2, T, D - 0.01, 0, 0, H/2, mat_body)

# Plinth base
add("Plinth", W, plinth_h, D * 0.88, 0, 0, plinth_h/2, mat_plinth)

# Cornice top strip
add("Cornice", W + 0.03, 0.06, D + 0.02, 0, 0, H + 0.03, mat_plinth)

# 3 doors
door_w = (W - T*2) / 3
gap = 0.004
for i in range(3):
    cx = -W/2 + T + door_w * i + door_w/2
    add(f"Door{i}", door_w - gap*2, H - plinth_h - T*2, 0.018,
        cx, D/2 - 0.009, plinth_h + T + (H - plinth_h - T*2)/2, mat_door)
    # Handle
    hx = cx + door_w * 0.28
    hz = plinth_h + T + (H - plinth_h - T*2) * 0.42
    add_cyl(f"Handle{i}", 0.007, 0.12, hx, D/2 + 0.004, hz, 1.5708, 0, 0, mat_handle)

# Mirror panel in center door zone (upper half)
mirror_cx = 0
add("Mirror", door_w * 0.72, (H - plinth_h - T*2) * 0.38, 0.005,
    mirror_cx, D/2 + 0.013, plinth_h + T + (H - plinth_h - T*2) * 0.68, mat_mirror)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Wardrobe"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\wardrobe.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
