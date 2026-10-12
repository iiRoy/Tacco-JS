const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";
const encoding = "utf8";

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  let matchCount = 0;

  const firstLine = inputLines[0];
  const secondLine = inputLines[1];

  const lineLength = firstLine.length;

  for (let charIndex = 0; charIndex < lineLength; charIndex++) {
    const charA = firstLine[charIndex];
    const charB = secondLine[charIndex];

    const isCharMatch = (charA === charB);

    if (isCharMatch) {
      matchCount++;
    }
  }
  console.log(matchCount);
}

processInputData(fileSystem.readFileSync(standardInputPath, encoding));
