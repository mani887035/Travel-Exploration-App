import zipfile
import sys

# Update the running jar
try:
    with zipfile.ZipFile(r'backend\target\travel-app-backend-1.0.0.jar', 'a', allowZip64=True) as z:
        z.write(r'backend\src\main\resources\db\migration\V5__add_tn_destinations.sql', 'BOOT-INF/classes/db/migration/V5__add_tn_destinations.sql')
    print('SQL updated and written to JAR!')
except Exception as e:
    print('Error:', e)
    sys.exit(1)
