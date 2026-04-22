"use strict"
function retrieveInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processAndCalculateSum(inputStringContent) {
  let parsedLines = inputStringContent.trim().split('\n');

  const rawGroupCount = parsedLines[0] ? parsedLines[0].trim() : '';
  const countOfGroups = parseInt(rawGroupCount, 10);

  const rawNumbersLine = parsedLines[1] ? parsedLines[1].trim() : '';
  const sortedNumberArray = rawNumbersLine.split(' ').filter(Boolean).map(Number);

  sortedNumberArray.sort((firstVal, secondVal) => {
    if (firstVal < secondVal) return 1;
    if (firstVal > secondVal) return -1;
    return 0;
  });

  let finalAccumulatedValue = 0;

  const maxLoopIndex = countOfGroups * 2;
  for (let currentPosition = 2; currentPosition <= maxLoopIndex; currentPosition += 2) {
    const elementValue = sortedNumberArray[currentPosition];
    finalAccumulatedValue += elementValue;
  }

  console.log(`Resulting sum: ${finalAccumulatedValue}`);
}

(function executeProgram() {
  const sourceData = retrieveInputData();
  processAndCalculateSum(sourceData);
})();