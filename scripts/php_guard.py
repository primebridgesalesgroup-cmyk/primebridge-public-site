#!/usr/bin/env python3
"""Fail on PHP execution artifacts in an A+ public release."""
from pathlib import Path
import subprocess
import sys

PHP_SUFFIXES = {'.php', '.php3', '.php4', '.php5', '.php7', '.php8', '.phtml', '.phar', '.inc'}
PHP_MANIFESTS = {'composer.json', 'composer.lock', '.user.ini'}
PHP_MARKERS = (b'<' + b'?php', b'<' + b'?=', b'#!' + b'/usr/bin/env php', b'#!' + b'/usr/bin/php')


def tracked_and_untracked(root: Path):
    result = subprocess.run(
        ['git', '-C', str(root), 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
        capture_output=True, check=True,
    )
    return [root / p.decode('utf-8', 'surrogateescape') for p in result.stdout.split(b'\0') if p]


def find_php(root: Path, paths=None):
    candidates = paths if paths is not None else tracked_and_untracked(root)
    findings = []
    for path in candidates:
        if not path.is_file() or path.is_symlink() or path.suffix.lower() in {'.pyc', '.pyo'}:
            continue
        relative = path.relative_to(root)
        if path.suffix.lower() in PHP_SUFFIXES or path.name.lower() in PHP_MANIFESTS:
            findings.append(str(relative) + ' (PHP file or manifest)')
            continue
        try:
            if path.stat().st_size <= 2_000_000 and any(marker in path.read_bytes() for marker in PHP_MARKERS):
                findings.append(str(relative) + ' (PHP execution marker)')
        except OSError as exc:
            findings.append(str(relative) + f' (unreadable: {exc})')
    return findings


def main():
    root = Path(__file__).resolve().parents[1]
    findings = find_php(root)
    output = root / '_public'
    if output.is_dir():
        findings += find_php(root, [p for p in output.rglob('*') if p.is_file()])
    if findings:
        print('BLOCKED: PHP artifact detected:\n' + '\n'.join(sorted(set(findings))), file=sys.stderr)
        return 1
    print('PASS: no PHP artifacts detected in source or generated public files')
    return 0


if __name__ == '__main__':
    sys.exit(main())
