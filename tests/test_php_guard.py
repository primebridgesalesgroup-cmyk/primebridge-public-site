import tempfile
import unittest
from pathlib import Path
from php_guard import find_php


class PhpGuardTests(unittest.TestCase):
    def test_php_extension_is_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            p = root / 'hidden.PHTML'
            p.write_text('test')
            self.assertTrue(find_php(root, [p]))

    def test_embedded_php_is_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            p = root / 'index.html'
            p.write_text('hello <?php echo 1; ?>')
            self.assertTrue(find_php(root, [p]))

    def test_plain_frontend_allowed(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            p = root / 'app.js'
            p.write_text('const ok = true;')
            self.assertEqual([], find_php(root, [p]))

    def test_composer_manifest_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            p = root / 'composer.json'
            p.write_text('{}')
            self.assertTrue(find_php(root, [p]))


if __name__ == '__main__':
    unittest.main()
