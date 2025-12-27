#!/usr/bin/env python3
"""
Analizza le immagini del vecchio sito CNC per identificare foto utili
e associare metadati estratti dagli HTML dove vengono usate.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Percorsi
OLD_SITE = Path("/Users/rforina/Code/cncvela/www.cncvela.it")
IMAGES_DIR = OLD_SITE / "images"
OUTPUT_FILE = Path("/Users/rforina/Code/cncvela/scripts/image_analysis.json")

# Pattern per identificare varianti responsive (es: foto-320.jpg, foto-960-1.jpg)
RESPONSIVE_PATTERN = re.compile(r'^(.+?)-(\d+)(-\d+)?\.([a-z]+)$', re.IGNORECASE)

# Pattern da escludere (icone, loghi, background, UI elements)
EXCLUDE_PATTERNS = [
    r'^bando-',           # Icone bando
    r'^classifica-',      # Icone classifica
    r'^copia-di-llogot',  # Logo
    r'^fr-',              # Icone/UI
    r'^hexellence',       # Pattern background
    r'^immagine-incollata', # UI elements generici
    r'^logo',             # Loghi
    r'^sezione',          # UI sections
    r'^thumb-',           # Thumbnails (dupplicati)
    r'^\d+/',             # Sottocartelle (varianti responsive)
    r'^[0-9a-z]/',        # Sottocartelle singolo carattere
]

# Pattern che indicano foto interessanti
INTERESTING_PATTERNS = [
    r'img_\d+',           # Foto da fotocamera (IMG_1234)
    r'dsc\d+',            # Foto Sony/Nikon (DSC00123)
    r'dji',               # Foto drone
    r'fullsizerender',    # Foto iPhone
    r'poster',            # Poster eventi (potrebbero essere foto)
    r'banner',            # Banner con foto
    r'20\d{6}',           # Date formato YYYYMMDD
    r'corso',             # Corsi
    r'regata',            # Regate
    r'cabinati',          # Corso cabinati
    r'finale',            # Foto finali eventi
    r'scd\d*-foto',       # Foto scuola derive
    r'396',               # Serie foto specifiche
    r'foto-',             # Foto esplicite
    r'clip-',             # Video clip/frames
]

def is_excluded(filename):
    """Verifica se il file è da escludere"""
    for pattern in EXCLUDE_PATTERNS:
        if re.match(pattern, filename, re.IGNORECASE):
            return True
    return False

def is_interesting(filename):
    """Verifica se il file potrebbe essere una foto interessante"""
    for pattern in INTERESTING_PATTERNS:
        if re.search(pattern, filename, re.IGNORECASE):
            return True
    return False

def get_base_name(filename):
    """Estrae il nome base rimuovendo suffissi responsive"""
    match = RESPONSIVE_PATTERN.match(filename)
    if match:
        return match.group(1), int(match.group(2)), match.group(4)
    # Nessun pattern responsive trovato
    name, ext = os.path.splitext(filename)
    return name, 0, ext.lstrip('.')

def find_image_in_html(image_name, html_files):
    """Cerca un'immagine nei file HTML e restituisce il contesto"""
    results = []
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            # Cerca riferimenti all'immagine
            if image_name in content:
                # Trova il contesto (titolo pagina, sezione, alt text)
                page_title = ""
                title_match = re.search(r'<title>([^<]+)</title>', content)
                if title_match:
                    page_title = title_match.group(1)
                
                # Cerca alt text vicino all'immagine
                alt_text = ""
                alt_pattern = rf'<img[^>]*{re.escape(image_name)}[^>]*alt=["\']([^"\']*)["\']'
                alt_match = re.search(alt_pattern, content, re.IGNORECASE)
                if alt_match:
                    alt_text = alt_match.group(1)
                
                # Cerca testi vicini all'immagine
                nearby_text = ""
                # Pattern per trovare testo descrittivo
                text_patterns = [
                    rf'<p[^>]*>([^<]{{20,200}})</p>\s*<[^>]*{re.escape(image_name)}',
                    rf'{re.escape(image_name)}[^>]*>\s*</[^>]*>\s*<p[^>]*>([^<]{{20,200}})</p>',
                ]
                for tp in text_patterns:
                    text_match = re.search(tp, content, re.IGNORECASE | re.DOTALL)
                    if text_match:
                        nearby_text = text_match.group(1).strip()[:200]
                        break
                
                results.append({
                    'html_file': str(html_file.relative_to(OLD_SITE)),
                    'page_title': page_title,
                    'alt_text': alt_text,
                    'nearby_text': nearby_text
                })
        except Exception as e:
            pass
    
    return results

def extract_date_from_filename(filename):
    """Prova a estrarre una data dal nome file"""
    # Pattern YYYYMMDD
    match = re.search(r'(20\d{2})(\d{2})(\d{2})', filename)
    if match:
        try:
            year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
            return f"{year}-{month:02d}-{day:02d}"
        except:
            pass
    
    # Pattern img_NNNN (non ha data ma indica foto da fotocamera)
    if re.search(r'img_\d{4}', filename, re.IGNORECASE):
        return None
    
    return None

def categorize_image(filename, html_context):
    """Categorizza l'immagine in base al nome e contesto"""
    filename_lower = filename.lower()
    categories = []
    
    # Basato su nome file
    if 'corso' in filename_lower or 'scd' in filename_lower:
        categories.append('corso_vela')
    if 'cabinati' in filename_lower:
        categories.append('corso_cabinati')
    if 'regat' in filename_lower:
        categories.append('regata')
    if 'banner' in filename_lower:
        categories.append('banner')
    if 'dji' in filename_lower:
        categories.append('drone')
    if 'finale' in filename_lower:
        categories.append('evento')
    if '396' in filename_lower:
        categories.append('galleria')
    
    # Basato su contesto HTML
    for ctx in html_context:
        page = ctx.get('page_title', '').lower()
        if 'scuola' in page:
            categories.append('corso_vela')
        if 'regat' in page:
            categories.append('regata')
        if 'foto' in page or 'video' in page:
            categories.append('galleria')
    
    return list(set(categories)) if categories else ['altro']

def main():
    print("🔍 Analisi immagini sito CNC...")
    
    # Trova tutti i file HTML
    html_files = list(OLD_SITE.glob("*.html"))
    print(f"   Trovati {len(html_files)} file HTML")
    
    # Raccogli tutte le immagini
    all_images = defaultdict(list)  # base_name -> [(size, filename, full_path)]
    
    for img_file in IMAGES_DIR.glob("**/*.jpg"):
        rel_path = img_file.relative_to(IMAGES_DIR)
        # Salta sottocartelle con nomi a singolo carattere (varianti responsive)
        if len(rel_path.parts) > 1 and len(rel_path.parts[0]) == 1:
            continue
        
        filename = img_file.name
        if is_excluded(filename):
            continue
        
        base_name, size, ext = get_base_name(filename)
        all_images[base_name].append({
            'size': size,
            'filename': filename,
            'path': str(img_file),
            'extension': ext
        })
    
    # Aggiungi PNG interessanti
    for img_file in IMAGES_DIR.glob("*.png"):
        filename = img_file.name
        if is_excluded(filename):
            continue
        if not is_interesting(filename):
            continue
        
        base_name, size, ext = get_base_name(filename)
        all_images[base_name].append({
            'size': size,
            'filename': filename,
            'path': str(img_file),
            'extension': ext
        })
    
    print(f"   Trovate {len(all_images)} immagini uniche (base names)")
    
    # Filtra e analizza
    interesting_images = []
    excluded_count = 0
    
    for base_name, variants in all_images.items():
        # Prendi la variante più grande
        variants.sort(key=lambda x: x['size'], reverse=True)
        best = variants[0]
        
        # Verifica se è interessante
        if not is_interesting(best['filename']) and not is_interesting(base_name):
            excluded_count += 1
            continue
        
        # Cerca contesto negli HTML
        html_context = find_image_in_html(base_name, html_files)
        
        # Estrai data
        date = extract_date_from_filename(best['filename'])
        
        # Categorizza
        categories = categorize_image(best['filename'], html_context)
        
        # Crea entry
        entry = {
            'base_name': base_name,
            'best_file': best['filename'],
            'best_path': best['path'],
            'best_size': best['size'],
            'variants_count': len(variants),
            'extension': best['extension'],
            'date': date,
            'categories': categories,
            'html_references': html_context[:3],  # Max 3 riferimenti
        }
        
        # Genera descrizione
        description_parts = []
        if date:
            description_parts.append(f"Data: {date}")
        if categories:
            cat_map = {
                'corso_vela': 'Corso di vela',
                'corso_cabinati': 'Corso cabinati',
                'regata': 'Regata',
                'banner': 'Banner sito',
                'drone': 'Foto aerea (drone)',
                'evento': 'Evento',
                'galleria': 'Galleria foto',
                'altro': ''
            }
            cats = [cat_map.get(c, c) for c in categories if cat_map.get(c)]
            if cats:
                description_parts.append(f"Tipo: {', '.join(cats)}")
        
        if html_context:
            pages = [c['page_title'] for c in html_context if c['page_title']]
            if pages:
                description_parts.append(f"Pagine: {', '.join(set(pages))}")
        
        entry['description'] = ' | '.join(description_parts) if description_parts else 'Foto CNC'
        
        interesting_images.append(entry)
    
    print(f"   Immagini interessanti: {len(interesting_images)}")
    print(f"   Escluse (icone/UI/loghi): {excluded_count}")
    
    # Ordina per data e categoria
    interesting_images.sort(key=lambda x: (x['date'] or '0000-00-00', x['base_name']), reverse=True)
    
    # Salva risultato
    output = {
        'generated_at': datetime.now().isoformat(),
        'total_unique_images': len(all_images),
        'interesting_images': len(interesting_images),
        'excluded_images': excluded_count,
        'images': interesting_images
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Risultati salvati in: {OUTPUT_FILE}")
    
    # Riepilogo categorie
    print("\n📊 Riepilogo per categoria:")
    cat_counts = defaultdict(int)
    for img in interesting_images:
        for cat in img['categories']:
            cat_counts[cat] += 1
    
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")
    
    # Mostra alcune foto esempio
    print("\n📷 Esempi di foto interessanti:")
    for img in interesting_images[:10]:
        print(f"   - {img['best_file']}: {img['description']}")

if __name__ == "__main__":
    main()


