#!/usr/bin/env python3
"""Fail closed on sensitive files in the static public release artifact."""
from pathlib import Path
import re
import sys

DENIED_NAMES = {'.env', '.htaccess', '.htpasswd', 'id_rsa', 'id_ed25519', 'composer.json', 'composer.lock'}
DENIED_SUFFIXES = {'.pem', '.key', '.p12', '.pfx', '.sqlite', '.db', '.php', '.phar', '.phtml', '.py', '.sh'}
SECRET_PATTERNS = (
    re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
    re.compile(rb'sk_(?:live|test)_[A-Za-z0-9]{12,}'),
    re.compile(rb'gh[pousr]_[A-Za-z0-9]{20,}'),
    re.compile(rb'(?i)(?:STRIPE_SECRET_KEY|DATABASE_URL|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*[^\s"\x27]{6,}'),
)

def audit(root: Path):
    findings = []
    if not root.is_dir():
        return [f'Missing release directory: {root}']
    for file in root.rglob('*'):
        relative = file.relative_to(root)
        if file.is_symlink():
            findings.append(f'{relative}: symlink not allowed')
            continue
        if not file.is_file():
            continue
        if file.name.lower() in DENIED_NAMES or file.suffix.lower() in DENIED_SUFFIXES or file.name.startswith('.env.'):
            findings.append(f'{relative}: denied file type')
        try:
            if file.stat().st_size <= 20_000_000 and any(p.search(file.read_bytes()) for p in SECRET_PATTERNS):
                findings.append(f'{relative}: possible secret content')
        except OSError as exc:
            findings.append(f'{relative}: unreadable ({exc})')
    return findings

if __name__ == '__main__':
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('_public')
    issues = audit(root)
    if issues:
        print('PUBLIC RELEASE BLOCKED:\n' + '\n'.join(issues), file=sys.stderr)
        sys.exit(1)
    print('PASS: public release artifact security checks')
