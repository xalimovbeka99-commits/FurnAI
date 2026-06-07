import bpy

print("====================================")
print("Hello from Blender Python Scripting!")
print("Default Scene Objects:")
for obj in bpy.data.objects:
    print(f" - {obj.name} ({obj.type})")
print("====================================")
