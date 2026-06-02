function processGridData(rawInputString) {
  const NEWLINE_SEPARATOR = "\n";
  const VALUE_SEPARATOR = " ";

  const inputLines = rawInputString.split(NEWLINE_SEPARATOR);

  const dimensionParts = inputLines[0].split(VALUE_SEPARATOR);
  const gridHeight = parseInt(dimensionParts[0], 10);
  const gridWidth = parseInt(dimensionParts[1], 10);
  const totalBlockTypes = parseInt(inputLines[1], 10);

  const blockCountsAsStrings = inputLines[2].split(VALUE_SEPARATOR);

  const colorSequence = [];
  for (let typeIndex = 0; typeIndex < totalBlockTypes; typeIndex++) {
    const currentBlockCount = parseInt(blockCountsAsStrings[typeIndex], 10);
    const blockElements = Array(currentBlockCount).fill(typeIndex + 1);
    colorSequence.push(...blockElements);
  }

  const gridRowStrings = [];
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const currentRowElements = [];
    const rowStartIndex = rowIndex * gridWidth;

    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
      currentRowElements.push(colorSequence[rowStartIndex + colIndex]);
    }

    let formattedRowString;
    if (rowIndex % 2 === 0) {
      formattedRowString = currentRowElements.join(VALUE_SEPARATOR);
    } else {
      formattedRowString = currentRowElements.reverse().join(VALUE_SEPARATOR);
    }
    gridRowStrings.push(formattedRowString);
  }

  const finalOutputString = gridRowStrings.join(NEWLINE_SEPARATOR);

  console.log(finalOutputString);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
