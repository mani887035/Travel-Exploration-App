"""
patch_jar_v2.py
Compiles changed Java source files and properly replaces them in the JAR
by creating a new ZIP that excludes old versions of patched files.
"""
import subprocess
import os
import sys
import zipfile
import shutil
import io

ROOT       = os.path.dirname(os.path.abspath(__file__))
BACKEND    = os.path.join(ROOT, 'backend')
JAR_PATH   = os.path.join(BACKEND, 'target', 'travel-app-backend-1.0.0.jar')
JAR_BAK    = JAR_PATH + '.bak'
SRC_ROOT   = os.path.join(BACKEND, 'src', 'main', 'java')
BUILD_TMP  = os.path.join(ROOT, '.patch_build2')

# Java source files that were changed - paths relative to SRC_ROOT (use forward slashes)
CHANGED_SOURCES = [
    'com/travelapp/wishlist/WishlistController.java',
    'com/travelapp/destination/Destination.java',
    'com/travelapp/config/SecurityConfig.java',
    'com/travelapp/destination/DestinationController.java',
]

def find_java():
    java_home = os.environ.get('JAVA_HOME', '')
    if java_home:
        javac = os.path.join(java_home, 'bin', 'javac.exe')
        if os.path.exists(javac):
            return javac
    for path_dir in os.environ.get('PATH', '').split(os.pathsep):
        javac = os.path.join(path_dir, 'javac.exe')
        if os.path.exists(javac):
            return javac
    for base in [
        r'C:\Program Files\Java',
        r'C:\Program Files\Eclipse Adoptium',
        r'C:\Program Files\Microsoft',
        r'C:\Program Files\BellSoft',
        r'C:\Program Files\Amazon Corretto',
    ]:
        if os.path.exists(base):
            for d in sorted(os.listdir(base), reverse=True):
                javac = os.path.join(base, d, 'bin', 'javac.exe')
                if os.path.exists(javac):
                    return javac
    return None

def read_jar_zip_section(jar_path):
    """Read JAR, return (prefix_bytes, zip_bytes)."""
    with open(jar_path, 'rb') as f:
        data = f.read()
    idx = data.find(b'PK\x03\x04')
    if idx == -1:
        return b'', data
    return data[:idx], data[idx:]

def setup_classpath(jar_path, out_dir):
    """Extract BOOT-INF/classes and BOOT-INF/lib from JAR as classpath."""
    os.makedirs(out_dir, exist_ok=True)
    lib_dir = os.path.join(out_dir, 'lib')
    classes_dir = os.path.join(out_dir, 'boot_classes')
    os.makedirs(lib_dir, exist_ok=True)
    os.makedirs(classes_dir, exist_ok=True)

    cp_items = [classes_dir]
    
    with zipfile.ZipFile(io.BytesIO(read_jar_zip_section(jar_path)[1]), 'r') as zf:
        for name in zf.namelist():
            if name.startswith('BOOT-INF/lib/') and name.endswith('.jar'):
                target = os.path.join(lib_dir, os.path.basename(name))
                if not os.path.exists(target):
                    with zf.open(name) as src, open(target, 'wb') as dst:
                        dst.write(src.read())
                cp_items.append(target)
            elif name.startswith('BOOT-INF/classes/') and name.endswith('.class'):
                rel = name[len('BOOT-INF/classes/'):]
                target = os.path.join(classes_dir, rel.replace('/', os.sep))
                os.makedirs(os.path.dirname(target), exist_ok=True)
                if not os.path.exists(target):
                    with zf.open(name) as src, open(target, 'wb') as dst:
                        dst.write(src.read())
    
    return cp_items

def compile_sources(javac, sources, cp_items, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    cp = os.pathsep.join(cp_items)
    src_files = [os.path.join(SRC_ROOT, s.replace('/', os.sep)) for s in sources]
    
    cmd = [javac, '-cp', cp, '-d', out_dir, '--release', '21'] + src_files
    print(f"\nCompiling: {' '.join(os.path.basename(s) for s in src_files)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("COMPILE ERROR:\n" + result.stderr)
        sys.exit(1)
    print("Compilation successful!")
    return out_dir

def get_compiled_entries(classes_dir):
    """Return dict of {jar_entry_name: file_data} for compiled classes."""
    entries = {}
    for root, _, files in os.walk(classes_dir):
        for f in files:
            if f.endswith('.class'):
                full = os.path.join(root, f)
                rel  = os.path.relpath(full, classes_dir).replace(os.sep, '/')
                entry = f'BOOT-INF/classes/{rel}'
                with open(full, 'rb') as fp:
                    entries[entry] = fp.read()
    return entries

def patch_jar_replace(jar_path, new_entries):
    """
    Rebuild the ZIP portion of the JAR replacing/adding entries from new_entries.
    Writes atomically.
    """
    prefix, zip_bytes = read_jar_zip_section(jar_path)
    
    # Collect ALL existing entries EXCEPT the ones we're replacing
    old_entries = {}
    with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zf:
        for info in zf.infolist():
            if info.filename not in new_entries:
                old_entries[info.filename] = (info, zf.read(info.filename))
    
    # Build new ZIP
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=True) as out:
        # Write old entries first
        for name, (info, data) in old_entries.items():
            out.writestr(info, data)
        # Write new/replaced entries
        for name, data in new_entries.items():
            print(f"  Replaced: {name}")
            out.writestr(name, data)
    
    new_zip = buf.getvalue()
    
    # Backup original
    if not os.path.exists(JAR_BAK):
        shutil.copy2(jar_path, JAR_BAK)
        print(f"Backup: {JAR_BAK}")
    
    # Write atomically via temp file
    tmp = jar_path + '.new'
    with open(tmp, 'wb') as f:
        f.write(prefix + new_zip)
    os.replace(tmp, jar_path)
    print(f"JAR updated ({len(new_entries)} entry/entries replaced).")

def main():
    print("=== Travel App JAR Patcher v2 ===\n")
    
    if not os.path.exists(JAR_PATH):
        print(f"ERROR: JAR not found: {JAR_PATH}")
        sys.exit(1)
    
    javac = find_java()
    if not javac:
        print("ERROR: javac not found. Install JDK and set JAVA_HOME.")
        sys.exit(1)
    print(f"javac: {javac}")
    
    if os.path.exists(BUILD_TMP):
        shutil.rmtree(BUILD_TMP)
    os.makedirs(BUILD_TMP)
    
    cp_dir      = os.path.join(BUILD_TMP, 'cp')
    compiled_dir = os.path.join(BUILD_TMP, 'out')
    
    print("Extracting classpath from JAR (this takes a moment)...")
    cp_items = setup_classpath(JAR_PATH, cp_dir)
    print(f"  {len(cp_items)} classpath items")
    
    compile_sources(javac, CHANGED_SOURCES, cp_items, compiled_dir)
    
    new_entries = get_compiled_entries(compiled_dir)
    print(f"\n{len(new_entries)} class file(s) compiled.")
    
    patch_jar_replace(JAR_PATH, new_entries)
    
    shutil.rmtree(BUILD_TMP)
    print("\n=== Done! Restart backend to apply changes. ===")

if __name__ == '__main__':
    main()
