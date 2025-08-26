const Speaker = require("speaker");
const fs = require("fs");

const example = {
  verses: [
    {
      verseNumber: 1,
      verseString: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      verseStringB: "In the name of Allah, the Compassionate, the Merciful.",
    },
  ],
  nameEnglish: "Humankind",
  nameTrans: "an-Nas",
  nameArabic: "الـناس",
  chapterNumber: 114,
  nVerses: 6,
};
const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 44100,
});
const quran = JSON.parse(fs.readFileSync("./quran.json", "utf8"));
// const DIR = "./quran";
// const fileNames = fs.readdirSync(DIR);
// const paragraphs = [];
// for (let i = 0; i < fileNames.length; i++) {
//   const fileName = fileNames[i];
//   const file = fs.readFileSync(`${DIR}/${fileName}`, "utf8");
//   const paragraph = JSON.parse(file);
//   paragraphs.push(paragraph);
// }
// fs.writeFileSync("./quran.json", JSON.stringify(paragraphs));

const paragraphs = quran[15].verses.map((verse) => {
  const verseString = verse.verseString;
  return verseString;
});

let time = 0;
let sampleRate = 44100;
let speed = 200;

function getNextSamples(samplesCount, frequency) {
  const buffer = Buffer.alloc(samplesCount * 2);
  for (let i = 0; i < samplesCount; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * time) * 0x7fff;
    buffer.writeInt16LE(sample, i * 2);
    time += 1 / sampleRate;
  }
  return buffer;
}

let index = 0;
let interval;

function playNextParagraph() {
  if (index >= paragraphs.length) {
    clearInterval(interval);
    speaker.end();
    return;
  }

  const paragraph = paragraphs[index];
  const frequency = paragraph.length * 2;
  speed = 200 + paragraph.split(" ").length * Math.PI * 2;
  // const frequency = 100 + paragraph.split(" ").length * 35;
  console.log(frequency, " ", speed);
  interval = setInterval(() => {
    speaker.write(getNextSamples(1024, frequency));
  }, (1024 / sampleRate) * speed);

  setTimeout(() => {
    clearInterval(interval);
    index++;
    playNextParagraph();
  }, speed);
}

playNextParagraph();
