const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Load the lexicon data
const lexiconFilePath = path.join(__dirname, '/data/book37/words-href.json');
const lexiconData = JSON.parse(fs.readFileSync(lexiconFilePath, 'utf-8'));

// Batch size (adjust based on your needs)
const BATCH_SIZE = 5;
// Output file to save definitions
const outputFilePath = path.join(
  __dirname,
  '/data/book37/word_definitions.json',
);

// Function to scrape definitions of a word
async function scrapeWordDefinition(href) {
  try {
    const { data } = await axios.get(href);
    const $ = cheerio.load(data);

    // Select the main content container for definitions
    const definitionsContainers = $(
      'div.dictionary-entry-content > div.definition-container',
    );

    // Array to hold all definitions found for this word
    let definitions = [];

    // Loop through each container and extract its definitions
    definitionsContainers.each((i, el) => {
      let definitionText = '';

      // Each definition consists of spans inside the current container
      $(el)
        .find('div.definition span')
        .each((i, spanEl) => {
          definitionText += $(spanEl).text().trim() + '\n';
        });

      if (definitionText.trim()) {
        definitions.push(definitionText.trim());
      }
    });

    return definitions.length > 0 ? definitions : null;
  } catch (error) {
    console.error(`Error scraping word definition for ${href}:`, error.message);
    return null;
  }
}

// Function to save definitions in batches
function saveBatchToFile(batchData) {
  // If the file already exists, read it and append the new data
  let existingData = [];
  if (fs.existsSync(outputFilePath)) {
    existingData = JSON.parse(fs.readFileSync(outputFilePath, 'utf-8'));
  }

  // Append new data and save
  const updatedData = [...existingData, ...batchData];
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(updatedData, null, 2),
    'utf-8',
  );
  console.log(`Batch saved. Total words processed: ${updatedData.length}`);
}

// Function to process the lexicon data in batches
async function processInBatches() {
  const totalWords = lexiconData.words.length;
  let batchData = [];

  for (let i = 0; i < totalWords; i += BATCH_SIZE) {
    // Clear the batch data for each new batch
    batchData = [];

    const batch = lexiconData.words.slice(i, i + BATCH_SIZE);
    console.log(
      `Processing batch from ${i + 1} to ${Math.min(i + BATCH_SIZE, totalWords)}...`,
    );

    // Loop over each word in the batch and scrape its definitions
    for (const word of batch) {
      const definitions = await scrapeWordDefinition(word.href);
      if (definitions) {
        batchData.push({
          word: word.word,
          href: word.href,
          definitions, // Store definitions as an array
        });
      }
    }

    // Save the batch data to the file
    saveBatchToFile(batchData);

    // Delay before starting the next batch (optional)
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Adjust delay as needed
  }

  console.log('All words processed!');
}

// Start processing
processInBatches();
