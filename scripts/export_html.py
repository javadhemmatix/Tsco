"""Build a portable HTML file with embedded CSS, JavaScript, font and images."""
from pathlib import Path
import base64
import mimetypes
import re
import sys

root = Path(__file__).resolve().parent.parent
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'tsco-landing.html'
html = (root / 'index.html').read_text()
css = (root / 'style.css').read_text()
js = (root / 'app.js').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>')
assets = set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|woff2|png|jpg|svg)', html))
for asset in sorted(assets):
    source = root / asset
    mime = mimetypes.guess_type(str(source))[0] or 'application/octet-stream'
    encoded = base64.b64encode(source.read_bytes()).decode('ascii')
    html = html.replace(asset, f'data:{mime};base64,{encoded}')
license_text = (root / 'assets/fonts/OFL.txt').read_text()
html = html.replace('</head>', '<script type="text/plain" id="vazirmatn-license">\n' + license_text + '\n</script></head>')
output.write_text(html)
print(f'Exported {output} ({output.stat().st_size:,} bytes, {len(assets)} embedded assets)')
