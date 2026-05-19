String.prototype.rightJustify = function(targetWidth) {
  const contentString = String(this);
  const totalPaddingString = ' '.repeat(targetWidth);
  return (totalPaddingString + contentString).slice(-targetWidth);
};

Number.prototype.rightJustify = function(targetWidth) {
  const stringRepresentation = String(this);
  return stringRepresentation.rightJustify(targetWidth);
};

Array.prototype.rightJustifyElements = function(targetWidth) {
  const sourceArray = this;
  return sourceArray.map(element => element.rightJustify(targetWidth));
};

Array.prototype.calculateSum = function() {
  const initialAccumulatorValue = 0;
  return this.reduce((currentAccumulator, currentElement) => {
    const numericValue = Number(currentElement);
    return numericValue + currentAccumulator;
  }, initialAccumulatorValue);
};

function processDataBlock(inputDataLines) {
  const lineCount = Number(inputDataLines.shift());
  if (lineCount === 0) {
    return false;
  }

  const columnTotals = Array(lineCount + 1).fill(0);

  for (let rowIndex = 0; rowIndex < lineCount; rowIndex++) {
    const currentInputLine = inputDataLines.shift();
    const rowNumbersAsStrings = currentInputLine.split(' ');

    const currentRowSum = rowNumbersAsStrings.calculateSum();
    rowNumbersAsStrings.push(currentRowSum);

    for (let colIndex = 0; colIndex < rowNumbersAsStrings.length; colIndex++) {
      columnTotals[colIndex] += Number(rowNumbersAsStrings[colIndex]);
    }

    console.log(rowNumbersAsStrings.rightJustifyElements(5).join(''));
  }

  console.log(columnTotals.rightJustifyElements(5).join(''));
  return true;
}

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const processedInputLines = rawInputData.trim().split('\n');

while (processDataBlock(processedInputLines)) {
  // Continue processing data blocks until '0' is encountered
}
