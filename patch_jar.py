"""
patch_jar.py
Compiles changed Java source files and patches them into the existing JAR.
Run from the Travel-App root directory.
"""
import subprocess
import os
import sys
import zipfile
import shutil
import glob

ROOT      = os.path.dirname(os.path.abspath(__file__))
BACKEND   = os.path.join(ROOT, 'backend')
JAR_PATH  = os.path.join(BACKEND, 'target', 'travel-app-backend-1.0.0.jar')
SRC_ROOT  = os.path.join(BACKEND, 'src', 'main', 'java')
BUILD_TMP = os.path.join(ROOT, '.patch_build')

# Java source files that were changed - paths relative to SRC_ROOT
CHANGED_SOURCES = [
    'com/travelapp/wishlist/WishlistController.java',
    'com/travelapp/destination/Destination.java',
]

def find_java():
    """Find javac on the system."""
    # Try JAVA_HOME first
    java_home = os.environ.get('JAVA_HOME', '')
    if java_home:
        javac = os.path.join(java_home, 'bin', 'javac.exe')
        if os.path.exists(javac):
            return javac
    # Try PATH
    for path_dir in os.environ.get('PATH', '').split(os.pathsep):
        javac = os.path.join(path_dir, 'javac.exe')
        if os.path.exists(javac):
            return javac
    # Common locations
    for base in [
        r'C:\Program Files\Java',
        r'C:\Program Files\Eclipse Adoptium',
        r'C:\Program Files\Microsoft',
        r'C:\Program Files\BellSoft',
    ]:
        if os.path.exists(base):
            for d in sorted(os.listdir(base), reverse=True):
                javac = os.path.join(base, d, 'bin', 'javac.exe')
                if os.path.exists(javac):
                    return javac
    return None

def extract_classpath_from_jar(jar_path, extract_dir):
    """Extract the BOOT-INF/lib jars and spring-boot-loader from the fat JAR."""
    print("Extracting classpath JARs from fat JAR...")
    cp_jars = []
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(jar_path, 'r') as zf:
        for name in zf.namelist():
            if name.startswith('BOOT-INF/lib/') and name.endswith('.jar'):
                target = os.path.join(extract_dir, os.path.basename(name))
                if not os.path.exists(target):
                    zf.extract(name, extract_dir)
                    # move it to flat dir
                    extracted = os.path.join(extract_dir, name)
                    os.makedirs(os.path.dirname(target), exist_ok=True)
                    if os.path.exists(extracted):
                        shutil.move(extracted, target)
                cp_jars.append(target)
    return cp_jars

def compile_sources(javac, sources, classpath_jars, classes_dir):
    """Compile the given Java source files."""
    os.makedirs(classes_dir, exist_ok=True)
    cp = os.pathsep.join(classpath_jars)
    src_files = [os.path.join(SRC_ROOT, s.replace('/', os.sep)) for s in sources]
    
    # Also extract BOOT-INF/classes from the JAR as classpath
    boot_classes = os.path.join(BUILD_TMP, 'boot_classes')
    os.makedirs(boot_classes, exist_ok=True)
    with zipfile.ZipFile(JAR_PATH, 'r') as zf:
        for name in zf.namelist():
            if name.startswith('BOOT-INF/classes/') and name.endswith('.class'):
                target_path = os.path.join(boot_classes, name[len('BOOT-INF/classes/'):])
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                with zf.open(name) as src, open(target_path, 'wb') as dst:
                    dst.write(src.read())
    
    full_cp = boot_classes + os.pathsep + cp
    
    cmd = [javac, '-cp', full_cp, '-d', classes_dir, '--release', '21'] + src_files
    print(f"Compiling {len(src_files)} source file(s)...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("COMPILE ERROR:")
        print(result.stderr)
        sys.exit(1)
    print("Compilation successful!")
    return classes_dir

def patch_jar(jar_path, classes_dir):
    """Update the JAR in place with the newly compiled class files."""
    print(f"Patching JAR: {jar_path}")
    
    # Read the JAR as binary (it may have a Spring Boot prefix)
    with open(jar_path, 'rb') as f:
        jar_data = f.read()
    
    # Find ZIP start (may be offset for Spring Boot executable jar)
    zip_start = jar_data.find(b'PK\x03\x04')
    prefix = jar_data[:zip_start]
    zip_data = jar_data[zip_start:]
    
    tmp_zip = jar_path + '.tmp_patch'
    with open(tmp_zip, 'wb') as f:
        f.write(zip_data)
    
    # Patch the class files
    patched_count = 0
    with zipfile.ZipFile(tmp_zip, 'a', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(classes_dir):
            for fname in files:
                if fname.endswith('.class'):
                    full_path = os.path.join(root, fname)
                    # Relative path within classes_dir
                    rel = os.path.relpath(full_path, classes_dir).replace(os.sep, '/')
                    entry_name = f'BOOT-INF/classes/{rel}'
                    
                    # Remove existing entry if present
                    # (Python's zipfile 'a' mode doesn't remove, but writing over works for updates)
                    print(f"  Patching: {entry_name}")
                    with open(full_path, 'rb') as cf:
                        zf.writestr(entry_name, cf.read())
                    patched_count += 1
    
    # Reattach prefix
    with open(tmp_zip, 'rb') as f:
        updated_zip = f.read()
    
    # Backup original
    backup = jar_path + '.bak'
    shutil.copy2(jar_path, backup)
    print(f"Backup saved: {backup}")
    
    with open(jar_path, 'wb') as f:
        f.write(prefix + updated_zip)
    
    os.remove(tmp_zip)
    print(f"JAR patched with {patched_count} class file(s)!")
    return patched_count

def main():
    print("=== Travel App JAR Patcher ===\n")
    
    if not os.path.exists(JAR_PATH):
        print(f"ERROR: JAR not found at {JAR_PATH}")
        sys.exit(1)
    
    javac = find_java()
    if not javac:
        print("ERROR: javac not found. Please install JDK and set JAVA_HOME.")
        sys.exit(1)
    print(f"Found javac: {javac}")
    
    # Clean build temp
    if os.path.exists(BUILD_TMP):
        shutil.rmtree(BUILD_TMP)
    os.makedirs(BUILD_TMP)
    
    lib_dir    = os.path.join(BUILD_TMP, 'libs')
    classes_dir = os.path.join(BUILD_TMP, 'classes')
    
    cp_jars = extract_classpath_from_jar(JAR_PATH, lib_dir)
    print(f"Found {len(cp_jars)} dependency JARs")
    
    compile_sources(javac, CHANGED_SOURCES, cp_jars, classes_dir)
    patch_jar(JAR_PATH, classes_dir)
    
    # Cleanup
    shutil.rmtree(BUILD_TMP)
    print("\n=== Done! Restart the backend JAR to apply changes. ===")

if __name__ == '__main__':
    main()
