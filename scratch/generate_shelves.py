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

mat_frame  = mat("Frame",  "#b08050", roughness=0.72)  # oak
mat_shelf  = mat("Shelf",  "#c09060", roughness=0.68)  # lighter oak
mat_back   = mat("Back",   "#9a7040", roughness=0.80)
mat_book_a = mat("BookA",  "#8B2020", roughness=0.85)
mat_book_b = mat("BookB",  "#205080", roughness=0.85)
mat_book_c = mat("BookC",  "#306030", roughness=0.85)
mat_book_d = mat("BookD",  "#806020", roughness=0.85)
mat_book_e = mat("BookE",  "#502060", roughness=0.85)

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

W, H, D = 1.20, 2.20, 0.32
T = 0.022
shelf_count = 5

# Sides
box("SideL", T, H, D, -(W/2 - T/2), 0, H/2, mat_frame)
box("SideR", T, H, D,  (W/2 - T/2), 0, H/2, mat_frame)
# Top
box("Top",   W, T, D, 0, 0, H - T/2, mat_frame)
# Bottom
box("Bottom",W, T, D, 0, 0, T/2, mat_frame)
# Back panel
box("Back", W - T*2, H - T*2, 0.012, 0, -(D/2 - 0.006), T + (H - T*2)/2, mat_back)

# Shelves (evenly spaced)
inner_h = H - T*2
for i in range(shelf_count):
    sy = T + (i+1) * inner_h / (shelf_count + 1)
    box(f"Shelf{i}", W - T*2, T*0.85, D - 0.01, 0, 0, sy, mat_shelf)

# ── Decorative books on each shelf ───────────────────────────────
book_mats = [mat_book_a, mat_book_b, mat_book_c, mat_book_d, mat_book_e]
import random
random.seed(7)

inner_w = W - T*2
for i in range(shelf_count):
    sy = T + (i+1) * inner_h / (shelf_count + 1) + T*0.85/2
    bx = -inner_w/2 + 0.02
    j = 0
    while bx < inner_w/2 - 0.04:
        bw = random.uniform(0.04, 0.08)
        bh = random.uniform(0.18, 0.28)
        bd = D * random.uniform(0.60, 0.85)
        bcx = bx + bw/2
        bcz = sy + T*0.4/2 + bh/2
        m_book = book_mats[j % len(book_mats)]
        box(f"Book{i}_{j}", bw - 0.003, bh, bd, bcx, (D/2 - bd)/2 * random.uniform(-0.3, 0.3), bcz, m_book)
        bx += bw + random.uniform(0.003, 0.008)
        j += 1
        if bx > inner_w/2 - 0.06:
            break

# Small decorative object on top shelf
box("PlantPot",  0.08, 0.12, 0.08, inner_w/2 - 0.06, 0, H - T/2 + 0.06, mat_book_c)
box("PlantStem", 0.015, 0.18, 0.015, inner_w/2 - 0.06, 0, H - T/2 + 0.06 + 0.06 + 0.09, mat_book_c)

# Join all
for obj in bpy.data.objects:
    obj.select_set(False)
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
parts[0].name = "Shelves"

for obj in bpy.data.objects:
    obj.select_set(False)
parts[0].select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

out = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\shelves.glb"
os.makedirs(os.path.dirname(out), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=False)
print(f"SUCCESS: {out}")
