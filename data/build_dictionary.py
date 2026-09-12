"""Build the local browser word set from the downloaded upstream source."""
import json
from pathlib import Path

directory = Path(__file__).resolve().parent
words = sorted({
    word.strip().lower()
    for word in (directory / 'words_alpha.txt').read_text(encoding='utf-8').splitlines()
    if word.strip().isascii() and word.strip().isalpha()
    and 2 <= len(word.strip()) <= 10
})
if len(words) < 1000 or not {'cat', 'dog', 'hello'}.issubset(words):
    raise ValueError('Source does not contain the expected English word list')
(directory / 'english-words.js').write_text(
    '// Source: dwyl/english-words; see README.md and LICENSE-english-words.md.\n'
    'window.ENGLISH_WORDS = new Set(' + json.dumps('\n'.join(words))
    + '.split("\\n"));\n', encoding='utf-8'
)
print(f'Bundled {len(words):,} English words.')
