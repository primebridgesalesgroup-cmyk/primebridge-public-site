import tempfile
from pathlib import Path
import unittest
from release_security import audit

class ReleaseSecurityTests(unittest.TestCase):
    def test_empty_directory_is_accepted(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(audit(Path(d)), [])

    def test_missing_release_fails(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertTrue(audit(Path(d) / 'missing'))

    def test_key_file_is_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / 'server.pem').write_text('dummy')
            self.assertTrue(audit(Path(d)))

    def test_embedded_private_key_is_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / 'index.html').write_text('-----BEGIN PRIVATE KEY-----')
            self.assertTrue(audit(Path(d)))

    def test_symlink_is_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            (root / 'target.txt').write_text('safe')
            (root / 'link.txt').symlink_to(root / 'target.txt')
            self.assertTrue(audit(root))

if __name__ == '__main__':
    unittest.main()
