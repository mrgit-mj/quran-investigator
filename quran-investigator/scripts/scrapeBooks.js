const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL to scrape
const url =
  'http://arabiclexicon.hawramani.com/academy-of-the-arabic-language-in-cairo-al-mujam-al-wasit/';

// Function to scrape the data
async function scrape() {
  try {
    // Fetch the page content
    const { data } = await axios.get(url);

    // Load the page into cheerio
    const $ = cheerio.load(data);

    // Get the book title and description (modify the selectors as needed)
    const bookTitle = $('h1').text().trim();
    const description = $('div.description').text().trim(); // Modify to match actual class

    // Find all words with their hrefs
    const words = [];
    $('a[href]').each((index, element) => {
      const word = $(element).text().trim();
      const href = $(element).attr('href');
      if (word && href) {
        words.push({ word, href });
      }
    });

    // Create the output object
    const output = {
      bookTitle,
      description,
      words,
    };

    // Write the data to a JSON file
    fs.writeFileSync(
      'words-href.json',
      JSON.stringify(output, null, 2),
      'utf-8',
    );
    console.log('Data saved to lexicon_data.json');
  } catch (error) {
    console.error('Error occurred while scraping:', error);
  }
}

// Run the scraper
scrape();
