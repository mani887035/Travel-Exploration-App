import urllib.request, urllib.parse, json, os

files = {
    'Vellore': ['File:Vellore Fort main entrance.jpg', 'File:Jalakandeswarar temple in vellore.jpg', 'File:Golden Temple, Sripuram.jpg'],
    'Kodaikanal': ['File:Kodaikanal Lake.JPG', 'File:Coakers Walk Kodaikanal.jpg', 'File:Pillar Rocks Kodaikanal.jpg'],
    'Kanniyakumari': ['File:Kanyakumari rock temple.jpg', 'File:Thiruvalluvar Statue, Kanyakumari.jpg', 'File:Sunrise at Kanyakumari.jpg'],
    'Rameshwaram': ['File:Pamban Bridge.jpg', 'File:Ramanathaswamy Temple Corridor.jpg', 'File:Dhanushkodi Beach.jpg'],
    'Hogenakkal': ['File:Hogenakkal falls.jpg', 'File:Hogenakkal Coracle.jpg', 'File:Hogenakkal Water Falls.JPG'],
    'Yelagiri': ['File:Yelagiri Mountains.jpg', 'File:Punganur lake, Yelagiri.JPG', 'File:Swamimalai Hill, Yelagiri.jpg'],
    'Yercaud': ['File:Yercaud Lake.jpg', 'File:Killiyur Falls Yercaud.jpg', 'File:Yercaud view from ladys seat.JPG']
}

out_map = {}
for p, arr in files.items():
    urls = []
    for f in arr:
        try:
            url = f'https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(f)}&prop=imageinfo&iiprop=url&format=json'
            req = urllib.request.Request(url, headers={'User-Agent': 'TravelBot/1.0'})
            data = json.loads(urllib.request.urlopen(req).read())
            pages = data['query']['pages']
            pid = list(pages.keys())[0]
            if 'imageinfo' in pages[pid]:
                urls.append(pages[pid]['imageinfo'][0]['url'])
        except Exception as e:
            print(p, f, e)
    
    # Download them using urllib with Mozilla agent
    safe_name = p.lower().replace(' ', '')
    paths = []
    for i, u in enumerate(urls, 1):
        filepath = f'frontend/img/{safe_name}_real_{i}.jpg'
        try:
            dreq = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36'})
            with urllib.request.urlopen(dreq) as resp, open(filepath, 'wb') as out:
                out.write(resp.read())
            paths.append(f'img/{safe_name}_real_{i}.jpg')
        except Exception as e:
            print('DL err', u, e)
            
    if len(paths) == 0:
        paths = ['img/placeholder.jpg']*3
    elif len(paths) == 1:
        paths = [paths[0]]*3
    elif len(paths) == 2:
        paths = [paths[0], paths[1], paths[0]]
    out_map[p] = paths

# Apply to json mappings
js_file = 'frontend/js/image_data.js'
with open(js_file, 'r') as f:
    js_data = f.read()

json_str = js_data[js_data.find('{'):js_data.rfind('}')+1]
dest = json.loads(json_str)

for k, v in out_map.items():
    dest[k] = v

with open(js_file, 'w') as f:
    f.write('const DEST_IMAGES = ' + json.dumps(dest, indent=2) + ';\n')

print('Images fetched and mapped successfully.')
