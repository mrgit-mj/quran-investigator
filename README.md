# Quran Investigator

## Project Purpose
**Quran Investigator** is an exploratory toolkit for the Quran.  
It bundles:
- A **React-based viewer** for browsing chapters, verses, and word-level details.
- An **experimental Node.js sound generator**.
- Local **JSON data files** containing Arabic verses with English translations.

---

## Architecture

### Viewer
A React/TypeScript application that:
- Renders chapter lists, verse views, and commentary panels.  
- Tracks selected words and fetches details and related words via hooks and shared components.

### Sound Script
A Node.js program that:
- Loads text from `quran.json`.  
- Converts verse lengths into sine-wave tones using the **speaker** library.  
- Plays them sequentially.

### Data
- Chapter-wise JSON files with Arabic text (`verseString`) and English translations (`verseStringB`).  
- Example: opening chapter stored in `quran-arabic-english-json-allah/*.json`.

---

## Setup Instructions

### Viewer
```bash
cd quran-viewer
npm install
```

Define REACT_APP_API_URL for the backend service.

Data

JSON files are stored under quran-arabic-english-json-allah/.

If needed, unzip quran-arabic-english-json-allah.zip for a fresh copy.

Data Sources

Local chapter files: quran-arabic-english-json-allah/*.json
(containing verse numbers, Arabic text, and English translations).

Consolidated sound/quran.json consumed by the sound script.

No external downloads are required.

API Requirements

The viewer uses Axios with a base URL defined by REACT_APP_API_URL.

Expected REST endpoints:

GET /quran/chapters – chapter metadata

GET /quran/chapters/{chapterId}/verses – verses in a chapter

GET /quran/verses/{verseId}/words – word-level breakdowns

POST /quran/words/related with { wordId, limit } – retrieve related words and their verses