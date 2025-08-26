Project purpose
Quran Investigator is an exploratory toolkit for the Quran. It bundles a React-based viewer for browsing chapters, verses and word‑level details, an experimental Node.js sound generator, and local JSON data files containing Arabic verses with English translations.

Architecture
Viewer – A React/TypeScript application that renders chapter lists, verse views, and commentary panels. It tracks selected words and fetches details and related words via hooks and shared components

Sound script – A Node program that loads text from quran.json, converts verse lengths into sine‑wave tones using the speaker library, and plays them sequentially

Data – Chapter‑wise JSON files with Arabic text (verseString) and English translations (verseStringB) such as the opening chapter shown below

Setup instructions
Viewer

cd quran-viewer

npm install

Define REACT_APP_API_URL for the backend service.

npm start to run the development server

Sound script

cd sound

npm install

node sound.js to synthesize audio from the text dataset

Data

JSON files are already stored under quran-arabic-english-json-allah; unzip quran-arabic-english-json-allah.zip if a fresh copy is required.

Data sources
Local chapter files (quran-arabic-english-json-allah/*.json) containing verse numbers, Arabic text, and an English translation.

Consolidated sound/quran.json consumed by the sound script. No external download is required.

API requirements
The viewer uses Axios with a base URL defined by REACT_APP_API_URL

Expected REST endpoints:

GET /quran/chapters for chapter metadata

GET /quran/chapters/{chapterId}/verses for verses in a chapter

GET /quran/verses/{verseId}/words for word-level breakdowns

POST /quran/words/related with { wordId, limit } to retrieve related words and their verses

Testing
⚠️ No tests were executed; the task was exploratory documentation only.