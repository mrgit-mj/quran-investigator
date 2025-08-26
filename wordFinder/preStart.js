const fs = require("fs");

const DIR = "./quran";
const fileNames = fs.readdirSync(DIR);
const paragraphs = [];
for (let i = 0; i < fileNames.length; i++) {
  const fileName = fileNames[i];
  const file = fs.readFileSync(`${DIR}/${fileName}`, "utf8");
  const paragraph = JSON.parse(file);
  paragraphs.push(paragraph);
}
fs.writeFileSync("./quran.json", JSON.stringify(paragraphs));
