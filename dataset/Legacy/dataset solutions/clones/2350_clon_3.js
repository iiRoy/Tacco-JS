function processInput(rawDataString) {
  const trimmedContent = rawDataString.trim();
  const characterSequence = trimmedContent.split("");
  const sequenceLength = characterSequence.length;

  let necessaryModifications = 0;

  const halfLength = Math.floor(sequenceLength / 2);

  for (let currentIdx = 0; currentIdx < halfLength; currentIdx++) {
    const charAtStart = characterSequence[currentIdx];
    const charAtEnd = characterSequence[sequenceLength - 1 - currentIdx];

    if (charAtStart !== charAtEnd) {
      necessaryModifications++;
    }
  }

  console.log(necessaryModifications);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const fileContentBuffer = fileSystemHandler.readFileSync(standardInputPath, "utf8");

processInput(fileContentBuffer);
