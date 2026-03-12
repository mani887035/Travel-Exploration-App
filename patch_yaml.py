"""
patch_yaml.py  — Replaces application.yml in the Spring Boot JAR
"""
import zipfile, io, shutil, os, sys

ROOT     = os.path.dirname(os.path.abspath(__file__))
JAR_PATH = os.path.join(ROOT, 'backend', 'target', 'travel-app-backend-1.0.0.jar')
YML_SRC  = os.path.join(ROOT, 'backend', 'src', 'main', 'resources', 'application.yml')
ENTRY    = 'BOOT-INF/classes/application.yml'

with open(JAR_PATH, 'rb') as f:
    data = f.read()
idx = data.find(b'PK\x03\x04')
prefix, zip_bytes = data[:idx], data[idx:]

with open(YML_SRC, 'rb') as f:
    new_yaml = f.read()

# Read old zip, filter out old YAML entry, add new one
old_entries = {}
with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
    for info in zf.infolist():
        if info.filename != ENTRY:
            old_entries[info.filename] = (info, zf.read(info.filename))

buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=True) as out:
    for name, (info, content) in old_entries.items():
        out.writestr(info, content)
    out.writestr(ENTRY, new_yaml)
    print(f"  Replaced: {ENTRY}")

tmp = JAR_PATH + '.yaml_patch'
with open(tmp, 'wb') as f:
    f.write(prefix + buf.getvalue())
os.replace(tmp, JAR_PATH)
print("application.yml patched into JAR successfully!")
