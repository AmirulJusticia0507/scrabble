# English word list

Source: https://github.com/dwyl/english-words
Downloaded on 2026-09-12 from:
https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt

The upstream LICENSE.md is included as LICENSE-english-words.md (Unlicense).
The upstream README also attributes its source data to Infochimps and notes
that copyright belongs to the original owners.

words_alpha.txt is the original downloaded list. english-words.js contains
248,437 unique lowercase ASCII alphabetic words of length 2–10, matching
the board dimensions. It is a general vocabulary list, not an official
Scrabble tournament lexicon, and contains uncommon words and abbreviations.
Presence in this list determines acceptance in this project's practice mode.

The browser loads the bundled JavaScript locally, including via file://.
No remote service is needed for scoring. Optional definitions from
dictionaryapi.dev time out after five seconds and never affect acceptance.

To download a fresh source using the CLI from the project directory:

```powershell
curl.exe --fail --location --max-time 45 https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt -o data/words_alpha.txt
python data/build_dictionary.py
```

Updating the source can change which words the game accepts.
