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

mat_body   = mat("Body",   "#f0e8dc", roughness=0.70)
mat_door   = mat("Door",   "#e8dece", roughness=0.60)
mat_leg    = mat("Leg",    "#c0a030", roughness=0.12, metalness=0.90)
mat_handle = mat("Handle", "#c8a840", roughness=0.12, metalness=0.90)
mat_shelf  = mat("Shelf",  "#ded4c4", roughness=0.72)
mat_back   = mat("Back",   "#d8cfc0", roughness=0.80)

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
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=h,
        location=(x, y, z), rotation=(rx, ry, rz))
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    parts.append(obj)
    return obj

W, H, D = 1.10, 0.88, 0.48
T = 0.020
leg_h = 0.12

# 4 tapered metal legs
for sx, sz in [(-1, -1), (1, -1), (-1, 1), (1, 1)]:
    cyl(f"Leg{sx}{sz}", 0.022, leg_h,
        sx * (W/2 - 0.08), sz * (D/2 - 0.08), leg_h/2,
        0, 0, 0, mat_leg)

# Carcass sides / top / bottom
box("LeftPanel",  T, H, D, -(W/2 - T/2), 0, leg_h + H/2,        mat_body)
box("RightPanel", T, H, D,  (W/2 - T/2), 0, leg_h + H/2,        mat_body)
box("TopPanel",   W, T, D, 0, 0, leg_h + H - T/2,                mat_body)
box("BottomPanel",W, T, D, 0, 0, leg_h + T/2,                    mat_body)
box("BackPanel",  W - T*2, H - T*2, 0.010, 0, -(D/2 - 0.005), leg_h + T + (H-T*2)/2, mat_back)

# Mid divider
box("MidDivider", W - T*2, T, D - 0.01, 0, 0, leg_h + H/2,      mat_body)

# Upper section: 3 drawers
drawer_rows = 3
upper_h = H / 2
for i in range(drawer_rows):
    dz = leg_h + H/2 + T + (i + 0.5) * (upper_h - T) / drawer_rows
    box(f"Drawer{i}", W - T*2 - 0.010, upper_h/drawer_rows - 0.008, 0.015,
        0, D/2 + 0.0075, dz, mat_door)
    cyl(f"DrawerHandle{i}", 0.007, 0.16, 0, D/2 + 0.020, dz, 1.5708, 0, 0, mat_handle)

# Lower section: 2 doors
lower_h = H / 2 - T
door_w = (W - T*2) / 2
gap = 0.004
for i in range(2):
    cx = -W/2 + T + door_w * i + door_w/2
    box(f"LowerDoor{i}", door_w - gap*2, lower_h - 0.010, 0.015,
        cx, D/2 + 0.0075, leg_h + T + (lower_h - 0.010)/2, mat_door)
    hx = cx + (1 if i == 0 else -1) * door_w * 0.30
    cyl(f"DoorHandle{i}", 0.006, 0.06,
        hx, D/2 + 0.018, leg_h + T + lower_h * 0.55,
        0, 0, 0, mat_handle)

# Optional display shelf on top
box("DisplayTop", W + 0.02, 0.025, D * 0.55,
    0, 0, leg_h + H + 0.012, mat_shelf)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Cabinet"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\cabinet.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
