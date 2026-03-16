import zipfile
import sys
import os

jar_path = r'backend\target\travel-app-backend-1.0.0.jar'
sql_path = r'backend\src\main\resources\db\migration\V5__add_tn_destinations.sql'
zip_path = 'temp.zip'

try:
    with open(jar_path, 'rb') as f:
        data = f.read()

    # Find the zip header
    idx = data.find(b'PK\x03\x04')
    if idx == -1:
        print('Zip header not found!')
        sys.exit(1)
        
    prefix = data[:idx]
    zip_data = data[idx:]
    
    with open(zip_path, 'wb') as f:
        f.write(zip_data)
        
    # Update the zip
    with zipfile.ZipFile(zip_path, 'a') as z:
        z.write(sql_path, 'BOOT-INF/classes/db/migration/V5__add_tn_destinations.sql')
        
    # Read the updated zip
    with open(zip_path, 'rb') as f:
        updated_zip_data = f.read()
        
    # Write back to JAR
    with open(jar_path, 'wb') as f:
        f.write(prefix + updated_zip_data)
        
    os.remove(zip_path)
    print('JAR updated successfully!')
except Exception as e:
    print('Failed:', e)
