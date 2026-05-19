function solveProblem(rawInputString) {
  const lines = rawInputString.split("\n");

  const dataSize = parseInt(lines[0], 10);

  const parseNumbersFromLine = (lineStr) => {
    return lineStr.split(" ").map(Number);
  };

  const firstLineTokens = parseNumbersFromLine(lines[1]);
  const secondLineTokens = parseNumbersFromLine(lines[2]);
  const thirdLineTokens = parseNumbersFromLine(lines[3]);

  const arrayOne = firstLineTokens;
  const arrayTwo = secondLineTokens;
  const arrayThree = thirdLineTokens;

  let totalCombinations = 0;

  for (let idxOuter = 0; idxOuter < dataSize; idxOuter++) {
    const currentAValue = arrayOne[idxOuter];
    for (let idxMiddle = 0; idxMiddle < dataSize; idxMiddle++) {
      const currentBValue = arrayTwo[idxMiddle];
      if (currentAValue < currentBValue) {
        for (let idxInner = 0; idxInner < dataSize; idxInner++) {
          const currentCValue = arrayThree[idxInner];
          if (currentBValue < currentCValue) {
            totalCombinations++;
          }
        }
      }
    }
  }

  console.log(totalCombinations);
}

const fileSystem = require("fs");
const STDIN_PATH = "/dev/stdin";

const fileContent = fileSystem.readFileSync(STDIN_PATH, "utf8");
solveProblem(fileContent);
