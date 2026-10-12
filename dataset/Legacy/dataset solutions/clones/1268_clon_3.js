const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const inputLines = rawInputContent.split("\n");

const terminationCondition = "0 0";
let currentLineIndex = 0;

while (inputLines[currentLineIndex] !== terminationCondition) {
  const currentDimensionString = inputLines[currentLineIndex];
  const dimensionParts = currentDimensionString.split(" ");
  const numericDimensions = dimensionParts.map(Number);

  const [gridHeight, gridWidth] = numericDimensions;

  for (let rowCounter = 0; rowCounter < gridHeight; rowCounter++) {
    let constructedRow = "";
    const rowPatternOffset = rowCounter % 2;

    for (let columnCounter = 0; columnCounter < gridWidth; columnCounter++) {
      const effectivePatternPosition = columnCounter + rowPatternOffset;
      constructedRow += (effectivePatternPosition % 2 === 0) ? "#" : ".";
    }
    console.log(constructedRow);
  }
  console.log("");
  currentLineIndex++;
}
