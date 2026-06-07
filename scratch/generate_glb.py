import bpy
import os

# 1. Clear existing objects in the default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 2. Create Tabletop (Cube scaled to table proportions)
# Tabletop height is at z=0.9m, scaled down to 0.05m thickness
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.9))
table_top = bpy.context.active_object
table_top.name = "TableTop"
table_top.scale = (1.6, 0.9, 0.05) # Width: 1.6m, Depth: 0.9m, Thickness: 0.05m

# 3. Create 4 legs (Cylinders)
# Leg height is 0.85m, positioned at z=0.425m (half of leg height)
leg_height = 0.85
leg_positions = [
    (-0.7, -0.38),
    (0.7, -0.38),
    (-0.7, 0.38),
    (0.7, 0.38)
]

legs = []
for i, (x, y) in enumerate(leg_positions):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=leg_height, location=(x, y, leg_height / 2))
    leg = bpy.context.active_object
    leg.name = f"Leg_{i}"
    legs.append(leg)

# 4. Join all parts into one model
# Select all mesh objects
bpy.ops.object.select_all(action='SELECT')
# Set the tabletop as active object to merge everything into it
bpy.context.view_layer.objects.active = table_top
bpy.ops.object.join()
table_top.name = "CustomTable"

# 5. Export to GLB format for React Three Fiber (Web UI)
output_path = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\test_table.glb"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Export options
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False
)

print("====================================")
print(f"SUCCESS: Exported 3D Table model to: {output_path}")
print("====================================")
