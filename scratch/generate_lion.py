import bpy
import math
import random
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

# Create materials matching the warm, golden-orange and cream palette
mat_face = create_material("Lion_Face", "#ebd2b0", roughness=0.7)
mat_muzzle = create_material("Lion_Muzzle", "#fdfbf7", roughness=0.8)
mat_nose = create_material("Lion_Nose", "#a65e53", roughness=0.5)
mat_eye = create_material("Lion_Eye", "#171513", roughness=0.2)
mat_eye_glow = create_material("Lion_EyeGlow", "#e07a1b", roughness=0.3)
mat_mane_light = create_material("Mane_Light", "#e89f54", roughness=0.7)
mat_mane_med = create_material("Mane_Med", "#b86735", roughness=0.75)
mat_mane_dark = create_material("Mane_Dark", "#592e16", roughness=0.8)

parts = []

# Helper: Add and track custom mesh parts
def add_part(name, geo_type, pos, scale, rot=(0,0,0), material=None, **kwargs):
    if geo_type == "cube":
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos, rotation=rot)
    elif geo_type == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=pos, rotation=rot, segments=8, ring_count=8)
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

# 2. Build the main Head base (faceted UV sphere for low-poly look)
head = add_part("Head", "sphere", (0, 0, 0), (0.42, 0.48, 0.45), material=mat_face)

# Add Bevel Modifier to head for clean faceted low-poly look
bevel_mod = head.modifiers.new(name="Bevel", type='BEVEL')
bevel_mod.width = 0.03
bevel_mod.segments = 1

# 3. Muzzle and Snout ( Cream-colored facets, carefully proportioned)
muzzle_l = add_part("Muzzle_L", "cube", (-0.07, 0.32, -0.06), (0.1, 0.12, 0.1), rot=(0, 0.05, 0.1), material=mat_muzzle)
muzzle_r = add_part("Muzzle_R", "cube", (0.07, 0.32, -0.06), (0.1, 0.12, 0.1), rot=(0, -0.05, -0.1), material=mat_muzzle)
chin = add_part("Chin", "cube", (0, 0.28, -0.15), (0.12, 0.12, 0.08), rot=(0.1, 0, 0), material=mat_muzzle)
nose_bridge = add_part("Nose_Bridge", "cube", (0, 0.26, 0.08), (0.14, 0.22, 0.12), rot=(0.15, 0, 0), material=mat_face)

# 4. Nose (Triangular pyramid / cone pointing forward-down)
nose = add_part("Nose", "cone", (0, 0.4, 0.06), (0.1, 0.08, 0.08), rot=(1.3, 0, 3.14), material=mat_nose, vertices=3, radius1=0.5, depth=1.0)

# 5. Eyes (Charcoal sockets with amber centers)
socket_l = add_part("Socket_L", "cube", (-0.16, 0.31, 0.16), (0.12, 0.05, 0.1), rot=(0.1, 0.25, -0.15), material=mat_eye)
socket_r = add_part("Socket_R", "cube", (0.16, 0.31, 0.16), (0.12, 0.05, 0.1), rot=(0.1, -0.25, 0.15), material=mat_eye)

eye_l = add_part("Eye_L", "sphere", (-0.14, 0.33, 0.16), (0.045, 0.045, 0.045), material=mat_eye_glow)
eye_r = add_part("Eye_R", "sphere", (0.14, 0.33, 0.16), (0.045, 0.045, 0.045), material=mat_eye_glow)

# Brow Ridges (Slanted cubes for low-poly expression)
brow_l = add_part("Brow_L", "cube", (-0.17, 0.3, 0.22), (0.14, 0.1, 0.06), rot=(0.1, 0.2, -0.15), material=mat_face)
brow_r = add_part("Brow_R", "cube", (0.17, 0.3, 0.22), (0.14, 0.1, 0.06), rot=(0.1, -0.2, 0.15), material=mat_face)

# 6. Ears
ear_l = add_part("Ear_L", "cube", (-0.36, -0.05, 0.32), (0.12, 0.08, 0.18), rot=(0.2, 0.3, -0.4), material=mat_face)
ear_r = add_part("Ear_R", "cube", (0.36, -0.05, 0.32), (0.12, 0.08, 0.18), rot=(0.2, -0.3, 0.4), material=mat_face)

# 7. Generate Mane (Concentric layers of flat, leaf-like locks)
random.seed(42)

# We scale the mane locks to be flat (Y-scale=0.04) and long (Z-scale=0.7) to simulate stylized hair locks
lock_scale = (0.18, 0.04, 0.7)

# --- LAYER 1: Outer Collar (Dark and Medium Brown, sweeping back and down) ---
z_levels = [-0.4, -0.2, 0.0, 0.2]
for z_val in z_levels:
    radius = 0.45 + (0.08 * (1.0 - abs(z_val) * 2.0))
    num_spikes = 14 if z_val < 0.2 else 10
    angle_min = -120
    angle_max = 120
    
    for i in range(num_spikes):
        t = i / (num_spikes - 1) if num_spikes > 1 else 0.5
        angle_deg = angle_min + t * (angle_max - angle_min)
        angle_rad = math.radians(angle_deg)
        
        x = radius * math.sin(angle_rad)
        y = -0.15 + radius * math.cos(angle_rad) * 0.45
        z = z_val + (random.uniform(-0.03, 0.03))
        
        # Tilt locks back and down (pointing away from face)
        rx = math.radians(130 + random.uniform(-10, 10))
        ry = math.radians(random.uniform(-5, 5))
        rz = angle_rad + math.radians(random.uniform(-5, 5))
        
        sz = lock_scale[2] + random.uniform(-0.05, 0.1)
        sx = lock_scale[0] + random.uniform(-0.02, 0.03)
        sy = lock_scale[1] + random.uniform(-0.01, 0.01)
        
        rand_val = random.random()
        if z_val < -0.1:
            mat = mat_mane_dark if rand_val < 0.8 else mat_mane_med
        else:
            mat = mat_mane_med if rand_val < 0.7 else mat_mane_dark
            
        add_part(f"Mane_Outer_{z_val:.1f}_{i}", "cone", (x, y, z), (sx, sy, sz), rot=(rx, ry, rz), material=mat, vertices=4, radius1=0.5, depth=1.0)

# --- LAYER 2: Inner Face Frame (Medium and Light Golden Brown, framing cheeks) ---
cheek_z_levels = [-0.2, 0.0, 0.18]
for z_val in cheek_z_levels:
    radius = 0.38
    num_spikes = 8
    # Wrap closely around the jaw/cheeks
    angle_min = -90
    angle_max = 90
    
    for i in range(num_spikes):
        t = i / (num_spikes - 1) if num_spikes > 1 else 0.5
        angle_deg = angle_min + t * (angle_max - angle_min)
        # Skip the center face zone
        if abs(angle_deg) < 35:
            continue
            
        angle_rad = math.radians(angle_deg)
        x = radius * math.sin(angle_rad)
        y = 0.05 + radius * math.cos(angle_rad) * 0.35
        z = z_val + (random.uniform(-0.02, 0.02))
        
        # Pointing back and down along jawline
        rx = math.radians(120 + random.uniform(-8, 8))
        ry = math.radians(random.uniform(-5, 5))
        rz = angle_rad
        
        sz = (lock_scale[2] - 0.1) + random.uniform(-0.05, 0.05)
        sx = lock_scale[0] + random.uniform(-0.01, 0.02)
        sy = lock_scale[1]
        
        mat = mat_mane_light if random.random() < 0.6 else mat_mane_med
        add_part(f"Mane_Inner_{z_val:.1f}_{i}", "cone", (x, y, z), (sx, sy, sz), rot=(rx, ry, rz), material=mat, vertices=4, radius1=0.5, depth=1.0)

# --- LAYER 3: Top mohawk / Crown (Golden Light brown, sweeping up/back) ---
crest_count = 7
for i in range(crest_count):
    t = i / (crest_count - 1)
    y = -0.2 + t * 0.4
    x = random.uniform(-0.02, 0.02)
    z = 0.36 + (0.1 * math.sin(t * math.pi))
    
    # Pointing upwards and backwards
    rx = math.radians(-35 + random.uniform(-5, 5))
    ry = math.radians(random.uniform(-5, 5))
    rz = math.radians(180)
    
    sx = lock_scale[0] + random.uniform(-0.02, 0.02)
    sy = lock_scale[1]
    sz = (lock_scale[2] - 0.05) + random.uniform(-0.05, 0.08)
    
    mat = mat_mane_light if random.random() < 0.75 else mat_mane_med
    add_part(f"Mane_Crest_{i}", "cone", (x, y, z), (sx, sy, sz), rot=(rx, ry, rz), material=mat, vertices=4, radius1=0.5, depth=1.0)

# --- LAYER 4: Beard / Chin Bib (Dark/Medium Brown, pointing straight down) ---
beard_count = 5
for i in range(beard_count):
    t = i / (beard_count - 1)
    x = -0.12 + t * 0.24
    y = 0.2 - abs(x) * 0.2
    z = -0.24 - random.uniform(0.01, 0.05)
    
    # Pointing down and slightly back
    rx = math.radians(150 + random.uniform(-10, 10))
    ry = math.radians(random.uniform(-5, 5))
    rz = math.radians(0)
    
    sx = lock_scale[0] - 0.02
    sy = lock_scale[1]
    sz = (lock_scale[2] - 0.15) + random.uniform(-0.02, 0.05)
    
    mat = mat_mane_dark if random.random() < 0.7 else mat_mane_med
    add_part(f"Mane_Beard_{i}", "cone", (x, y, z), (sx, sy, sz), rot=(rx, ry, rz), material=mat, vertices=4, radius1=0.5, depth=1.0)

# 8. Join all mesh parts into a single object
# FIRST: Deselect all objects
for obj in bpy.data.objects:
    obj.select_set(False)

# SECOND: Select only the generated mesh parts
for part in parts:
    part.select_set(True)

# THIRD: Set the head as active and join
bpy.context.view_layer.objects.active = head
bpy.ops.object.join()
head.name = "LionBust"

# Apply location, rotation, and scale to the joined mesh ONLY
for obj in bpy.data.objects:
    obj.select_set(False)
head.select_set(True)
bpy.context.view_layer.objects.active = head
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# 9. Set up Camera and Lights for a 3D Studio Render
# Add Camera at a 3/4 portrait perspective
bpy.ops.object.camera_add(location=(1.5, 2.2, 0.6))
camera = bpy.context.active_object
camera.name = "StudioCamera"
bpy.context.scene.camera = camera

# Point Camera at the Lion Head using a Track To Constraint
constraint = camera.constraints.new(type='TRACK_TO')
constraint.target = head
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'

# Add Key Sun Light (Warm, from top-front-right)
bpy.ops.object.light_add(type='SUN', location=(3, 3, 3))
sun_key = bpy.context.active_object
sun_key.name = "Sun_Key"
sun_key.data.energy = 4.5
sun_key.data.color = (1.0, 0.94, 0.82) # Warm sun yellow

# Add Fill Sun Light (Cool, from front-left)
bpy.ops.object.light_add(type='SUN', location=(-3, 2, 1))
sun_fill = bpy.context.active_object
sun_fill.name = "Sun_Fill"
sun_fill.data.energy = 2.0
sun_fill.data.color = (0.75, 0.88, 1.0) # Cool blue shadow fill

# Add Rim Sun Light (Strong, from back-top-left to highlight silhouette)
bpy.ops.object.light_add(type='SUN', location=(-2, -3, 2.5))
sun_rim = bpy.context.active_object
sun_rim.name = "Sun_Rim"
sun_rim.data.energy = 3.8
sun_rim.data.color = (1.0, 0.96, 0.92) # Rim highlight

# 10. Configure Render Settings
render_dir = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\scratch"
os.makedirs(render_dir, exist_ok=True)
render_img_path = os.path.join(render_dir, "lion_render.png")

bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
bpy.context.scene.render.resolution_x = 720
bpy.context.scene.render.resolution_y = 1280
bpy.context.scene.render.filepath = render_img_path
bpy.context.scene.render.film_transparent = True

# Render and save
print("Rendering preview image...")
bpy.ops.render.render(write_still=True)
print(f"Preview image rendered to: {render_img_path}")

# 11. Export as GLB for Web integration
output_path = r"c:\Users\xalim\OneDrive\Desktop\FurnAI\public\lion_bust.glb"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=False
)

print("====================================")
print(f"SUCCESS: Exported 3D Lion Bust GLB to: {output_path}")
print("====================================")
