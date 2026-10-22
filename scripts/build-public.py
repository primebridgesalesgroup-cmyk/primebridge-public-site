"""Build the customer release from an explicit file allowlist, never the repository root."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_public'
PAGES = ('index.html', 'services.html', 'blockchain.html', 'milestones.html',
         'privacy.html', 'identity-security.html', 'waitlist.html', 'waitlist-privacy.html', '404.html')
FILES = (*PAGES, 'styles.css', 'workspace.css', 'ledger-theme.css', 'site.js',
         'inquiry.js', 'inquiry-delivery.js', 'waitlist.js', 'robots.txt',
         'sitemap.xml', 'CNAME', 'assets/primebridge-earth.webp')

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                raise ValueError('Duplicate ID: ' + attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
for name in FILES:
    source = ROOT / name
    if not source.is_file() or not source.stat().st_size:
        raise ValueError('Missing release asset: ' + name)
    target = OUTPUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
(OUTPUT / '.nojekyll').touch()
pages = {}
for name in PAGES:
    content = (OUTPUT / name).read_text()
    if re.search(r'buy\.stripe\.com/test_|\bfictional\b|\btest checkout\b|\bproduct preview\b', content, re.I):
        raise ValueError('Nonproduction content in release: ' + name)
    parser = Page()
    parser.feed(content)
    pages[(OUTPUT / name).resolve()] = parser
for page, parsed in pages.items():
    for link in parsed.links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc:
            continue
        if parts.path.startswith('/'):
            raise ValueError('Root absolute link: ' + link)
        target = (page.parent / unquote(parts.path)).resolve() if parts.path else page
        if target.is_dir():
            target /= 'index.html'
        if not target.is_relative_to(OUTPUT) or not target.is_file():
            raise ValueError(f'{page.name}: link leaves release: {link}')
        if parts.fragment and target in pages and parts.fragment not in pages[target].ids:
            raise ValueError(f'{page.name}: missing release anchor: {link}')
print(f'Customer release: {len(PAGES)} pages; {len(FILES)} approved files; no application preview or test checkout.')
