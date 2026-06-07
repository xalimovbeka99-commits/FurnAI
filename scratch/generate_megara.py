import bpy
import math
import mathutils
import os

# 1. Clear default objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Helper: Create material with BSDF settings
def create_material(name, hex_color, roughness=0.5, metalness=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    
    # Convert hex to RGBA
    hex_color = hex_color.lstrip('#')
    rgba = [int(hex_color[i:i+2], 16)/255.0 for i in (0, 2, 4)] + [1.0]
    
    bsdf.inputs['Base Color'].default_value = rgba
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metalness
    return mat

# Create materials matching Megara's palette
mat_skin = create_material("Meg_Skin", "#f5cbb5", roughness=0.6)
mat_dress = create_material("Meg_Dress", "#ab3c6b", roughness=0.7)
mat_belt = create_material("Meg_Belt", "#571a47", roughness=0.8)
mat_hair = create_material("Meg_Hair", "#4a1914", roughness=0.8)
mat_gold = create_material("Meg_Gold", "#d18838", roughness=0.2, metalness=0.85)
mat_eye = create_material("Meg_Eye", "#8d4ca3", roughness=0.4)
mat_lips = create_material("Meg_Lips", "#9c2635", roughness=0.6)

parts = []

# Helper: Add and track custom mesh parts
def add_part(name, geo_type, pos, scale, rot=(0,0,0), material=None, **kwargs):
    if geo_type == "cube":
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos, rotation=rot)
    elif geo_type == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=pos, rotation=rot, segments=8, ring_count=8)
    elif geo_type == "cylinder":
        vertices = kwargs.get("vertices", 8)
        radius = kwargs.get("radius", 0.5)
        depth = kwargs.get("depth", 1.0)
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos, rotation=rot)
    elif geo_type == "cone":
        vertices = kwargs.get("vertices", 4)
        radius1 = kwargs.get("radius1", 0.5)
        depth = kwargs.get("depth", 1.0)
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, depth=depth, location=pos, rotation=rot)
    
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    if material:
        obj.data.materials.append(material)
    
    # Apply local transform to keep mesh clean
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    parts.append(obj)
    return obj

# Helper: Add limb (cylinder aligned perfectly between start and end vectors)
def add_limb(name, start, end, radius, material):
    x1, y1, z1 = start
    x2, y2, z2 = end
    
    dx, dy, dz = x2 - x1, y2 - y1, z2 - z1
    dist = math.sqrt(dx**2 + dy**2 + dz**2)
    if dist == 0:
        return None
        
    mx, my, mz = (x1 + x2)/2, (y1 + y2)/2, (z1 + z2)/2
    
    # Use mathutils vector algebra to find rotation quaternion
    v_dir = mathutils.Vector((dx, dy, dz)).normalized()
    v_up = mathutils.Vector((0, 0, 1))
    
    rot_quat = v_up.rotation_difference(v_dir)
    rot_euler = rot_quat.to_euler()
    
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=radius, depth=dist, location=(mx, my, mz), rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(material)
    
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    parts.append(obj)
    return obj

# 2. Body Structure
# Torso/Chest
torso = add_part("Torso", "cube", (0, 0, 0.22), (0.16, 0.12, 0.26), material=mat_dress)
# Chest curves (bustline)
bust_l = add_part("Bust_L", "sphere", (-0.06, 0.08, 0.28), (0.09, 0.09, 0.09), material=mat_dress)
bust_r = add_part("Bust_R", "sphere", (0.06, 0.08, 0.28), (0.09, 0.09, 0.09), material=mat_dress)

# Slender waist and tilted hips/skirt
skirt = add_part("Skirt", "cylinder", (0, 0.02, -0.25), (0.32, 0.24, 0.7), rot=(0.08, -0.05, 0), material=mat_dress, radius=0.5, depth=1.0)
belt = add_part("Belt", "cylinder", (0, 0.03, 0.08), (0.34, 0.26, 0.08), rot=(0.12, -0.08, 0.05), material=mat_belt, radius=0.5, depth=1.0)

# Neck and Head
neck = add_part("Neck", "cylinder", (0, 0.01, 0.44), (0.06, 0.06, 0.18), material=mat_skin, radius=0.5, depth=1.0)
head = add_part("Head", "sphere", (0, 0.02, 0.58), (0.16, 0.16, 0.18), material=mat_skin)

# Face details (eyes, lips)
eye_l = add_part("Eye_L", "sphere", (-0.05, 0.09, 0.59), (0.02, 0.015, 0.015), rot=(0, 0.1, -0.1), material=mat_eye)
eye_r = add_part("Eye_R", "sphere", (0.05, 0.09, 0.59), (0.02, 0.015, 0.015), rot=(0, -0.1, 0.1), material=mat_eye)
lips = add_part("Lips", "cube", (0, 0.1, 0.53), (0.04, 0.015, 0.01), rot=(0.05, 0, 0.08), material=mat_lips) # Sassy smirk

# 3. Gold Medallions and Dress Straps
strap_l = add_limb("Strap_L", (-0.06, 0.08, 0.28), (-0.12, 0.04, 0.38), 0.02, mat_dress)
strap_r = add_limb("Strap_R", (0.06, 0.08, 0.28), (0.12, 0.04, 0.38), 0.02, mat_dress)
medallion_l = add_part("Medallion_L", "cylinder", (-0.12, 0.05, 0.38), (0.04, 0.04, 0.015), rot=(1.3, 0.2, 0), material=mat_gold, radius=0.5, depth=1.0)
medallion_r = add_part("Medallion_R", "cylinder", (0.12, 0.05, 0.38), (0.04, 0.04, 0.015), rot=(1.3, -0.2, 0), material=mat_gold, radius=0.5, depth=1.0)

# 4. Volumetric Hair Setup (The most prominent feature)
# Skull Wrap/Base hair
hair_base = add_part("Hair_Base", "sphere", (0, -0.04, 0.63), (0.17, 0.17, 0.16), material=mat_hair)
# Top Pouf/Quiff (Megara's signature high pouf)
hair_pouf1 = add_part("Hair_Pouf1", "sphere", (0, -0.01, 0.73), (0.15, 0.13, 0.14), rot=(-0.2, 0, 0), material=mat_hair)
hair_pouf2 = add_part("Hair_Pouf2", "sphere", (-0.04, 0.04, 0.70), (0.1, 0.1, 0.12), rot=(-0.1, 0.1, -0.1), material=mat_hair)

# Gold Hairband holding the Ponytail
hairband = add_part("Hairband", "cylinder", (0, -0.12, 0.72), (0.07, 0.07, 0.04), rot=(0.6, 0, 0), material=mat_gold, radius=0.5, depth=1.0)

# Massive Ponytail Cascade (Stacked, overlapping elements flowing down the back)
p_lock1 = add_part("P_Lock1", "sphere", (0, -0.18, 0.66), (0.14, 0.13, 0.18), rot=(0.4, 0, 0), material=mat_hair)
p_lock2 = add_part("P_Lock2", "sphere", (0, -0.22, 0.52), (0.13, 0.12, 0.22), rot=(0.3, 0, 0), material=mat_hair)
p_lock3 = add_part("P_Lock3", "sphere", (0, -0.25, 0.36), (0.12, 0.11, 0.22), rot=(0.25, 0, 0), material=mat_hair)
p_lock4 = add_part("P_Lock4", "sphere", (0, -0.27, 0.20), (0.1, 0.09, 0.2), rot=(0.2, 0, 0), material=mat_hair)
p_lock5 = add_part("P_Lock5", "cone", (0, -0.28, 0.05), (0.08, 0.07, 0.22), rot=(0.15, 0, 0), material=mat_hair, vertices=4, radius1=0.5, depth=1.0)

# Face-Framing Front Curls
curl_l = add_part("Curl_L", "cone", (-0.11, 0.08, 0.5), (0.03, 0.03, 0.22), rot=(0.2, 0.15, -0.1), material=mat_hair, vertices=4, radius1=0.5, depth=1.0)
curl_r = add_part("Curl_R", "cone", (0.11, 0.08, 0.5), (0.03, 0.03, 0.22), rot=(0.2, -0.15, 0.1), material=mat_hair, vertices=4, radius1=0.5, depth=1.0)

# 5. Sassy Hands-On-Hips Pose Limbs
# Left Arm
shoulder_l = (-0.14, 0.02, 0.36)
elbow_l = (-0.28, 0.05, 0.22)
hand_l = (-0.15, 0.09, 0.10) # Resting on hip
add_limb("Arm_L_Upper", shoulder_l, elbow_l, 0.028, mat_skin)
add_limb("Arm_L_Lower", elbow_l, hand_l, 0.022, mat_skin)
add_part("Hand_L", "sphere", hand_l, (0.03, 0.03, 0.03), material=mat_skin)

# Right Arm
shoulder_r = (0.14, 0.02, 0.36)
elbow_r = (0.26, 0.06, 0.23)
hand_r = (0.14, 0.08, 0.11) # Resting on hip
add_limb("Arm_R_Upper", shoulder_r, elbow_r, 0.028, mat_skin)
add_limb("Arm_R_Lower", elbow_r, hand_r, 0.022, mat_skin)
add_part("Hand_R", "sphere", hand_r, (0.03, 0.03, 0.03), material=mat_skin)

# 6. Join mesh parts into a single object
# Deselect all
for obj in bpy.data.objects:
    obj.select_set(False)

# Select only meshes
for part in parts:
    part.select_set(True)

# Set head as active and join
bpy.context.view_layer.objects.active = head
bpy.ops.object.join()
head.name = "MegaraBust"

# Add Bevel modifier to the joined mesh to clean up low-poly borders
bevel_mod = head.modifiers.new(name="Bevel", type='BEVEL')
bevel_mod.width = 0.006
bevel_mod.segments = 1

# Apply location, rotation, and scale to the joined mesh ONLY
for obj in bpy.data.objects:
    obj.select_set(False)
head.select_set(True)
bpy.context.view_layer.objects.active = head
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 7. Set up Camera and Lights for a 3D Studio Render
# Portrait Camera framing the bust
bpy.ops.object.camera_add(location=(0.0, 1.6, 0.46))
camera = bpy.context.active_object
camera.name = "StudioCamera"
bpy.context.scene.camera = camera

# Point Camera at the Head/Face
constraint = camera.constraints.new(type='TRACK_TO')
constraint.target = head
# Track constraint requires us to look at the mesh's center.
# Since head coordinates are baked at Z=0 (origin was applied), we target the head's offset.
# Instead of tracking head directly which is now at (0,0,0) after transform_apply, we track an empty target
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0.02, 0.46))
target_empty = bpy.context.active_object
target_empty.name = "CamTarget"

constraint.target = target_empty
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'

# Add Key Sun Light (Warm, from top-front-right)
bpy.ops.object.light_add(type='SUN', location=(3, 3, 3))
sun_key = bpy.context.active_object
sun_key.name = "Sun_Key"
sun_key.data.energy = 4.2
sun_key.data.color = (1.0, 0.93, 0.85)

# Add Fill Sun Light (Cool, from front-left)
bpy.ops.object.light_add(type='SUN', location=(-3, 2, 1))
sun_fill = bpy.context.active_object
sun_fill.name = "Sun_Fill"
sun_fill.data.energy = 1.8
sun_fill.data.color = (0.75, 0.85, 1.0)

# Add Rim Sun Light (Strong, from back-top-left to define hair/shoulder outline)
bpy.ops.object.light_add(type='SUN', location=(-1.5, -3, 2.5))
sun_rim = bpy.context.active_object
sun_rim.name = "Sun_Rim"
sun_rim.data.energy = 3.6
sun_rim.data.color = (1.0, 0.95, 0.95)

# 8. Configure Render Settings
render_dir = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\scratch"
os.makedirs(render_dir, exist_ok=True)
render_img_path = os.path.join(render_dir, "megara_render.png")

bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
bpy.context.scene.render.resolution_x = 720
bpy.context.scene.render.resolution_y = 1280
bpy.context.scene.render.filepath = render_img_path
bpy.context.scene.render.film_transparent = True

# Render and save
print("Rendering Megara preview image...")
bpy.ops.render.render(write_still=True)
print(f"Preview image rendered to: {render_img_path}")

# 9. Export as GLB for Web integration
output_path = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\megara.glb"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False
)

print("====================================")
print(f"SUCCESS: Exported 3D Megara GLB to: {output_path}")
print("====================================")
