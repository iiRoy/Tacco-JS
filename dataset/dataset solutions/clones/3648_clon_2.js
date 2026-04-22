let inputString;
let finalCount = 0;
let charArray;
const targetChars = ["A", "B", "C"];
const moduloVal = Math.pow(10, 9) + 7;

const inputProcessor = require('readline');
const interfaceHandler = inputProcessor.createInterface(
  {
    input: process.stdin,
    output: process.stdout,
  }
);

interfaceHandler.on('line',
  function (currentLine) {
    inputString = currentLine;
  }
);

interfaceHandler.on('close', function () {
  charArray = inputString.split("");
  exploreCombinations(0, []);
  console.log(finalCount);
});

function exploreCombinations(currentIndex, currentCombination) {
  if (currentIndex === charArray.length) {
    calculateSubsequences(currentCombination);
    return (0);
  }

  if (charArray[currentIndex] === "?") {
    currentCombination[currentIndex] = "A";
    exploreCombinations(currentIndex + 1, currentCombination);
    currentCombination[currentIndex] = "B";
    exploreCombinations(currentIndex + 1, currentCombination);
    currentCombination[currentIndex] = "C";
    exploreCombinations(currentIndex + 1, currentCombination);
  } else {
    currentCombination[currentIndex] = charArray[currentIndex];
    exploreCombinations(currentIndex + 1, currentCombination);
  }
}

function calculateSubsequences(currentCombination) {

  let dynamicProgramTable = Array(charArray.length).fill(null);

  for (let idx = 0; idx < charArray.length; idx++) {
    dynamicProgramTable[idx] = Array(3).fill(0);
  }

  if (currentCombination[0] === targetChars[0]) {
    dynamicProgramTable[0][0] += 1;
  }

  for (let idx = 1; idx < charArray.length; idx++) {
    if (currentCombination[idx] === targetChars[0]) {
      dynamicProgramTable[idx][0] += dynamicProgramTable[idx - 1][0] + 1;
    } else {
      dynamicProgramTable[idx][0] = dynamicProgramTable[idx - 1][0];
    }
  }

  for (let idx = 1; idx < targetChars.length; idx++) {
    dynamicProgramTable[0][idx] = 0;
  }

  for (let seqIdx = 1; seqIdx < 3; seqIdx++) {
    let charOccurrenceMap = {};
    for (let idx = 1; idx < charArray.length; idx++) {
      if (charOccurrenceMap[currentCombination[idx]] === undefined) {
        charOccurrenceMap[currentCombination[idx]] = 0;
      }

      if (currentCombination[idx] === targetChars[seqIdx] && dynamicProgramTable[idx - 1][seqIdx - 1] !== 0) {
        dynamicProgramTable[idx][seqIdx] += dynamicProgramTable[idx - 1][seqIdx - 1] + charOccurrenceMap[currentCombination[idx]];
        charOccurrenceMap[currentCombination[idx]]++;
      } else {
        dynamicProgramTable[idx][seqIdx] = dynamicProgramTable[idx - 1][seqIdx];
      }
    }
  }
  finalCount += (dynamicProgramTable[charArray.length - 1][2] % moduloVal);
}