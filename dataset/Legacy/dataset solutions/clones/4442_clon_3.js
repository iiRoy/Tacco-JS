function ProcessInput(rawData) {
  const inputLines = rawData.split("\n");

  const dimensionParts = inputLines[0].split(" ");
  const gridHeight = parseInt(dimensionParts[0]);
  const gridWidth = parseInt(dimensionParts[1]);

  const numColors = parseInt(inputLines[1]);

  const colorCountsStr = inputLines[2].split(" ");
  const colorCounts = new Array(numColors);
  for (let k = 0; k < numColors; k++) {
    colorCounts[k] = parseInt(colorCountsStr[k]);
  }

  const colorSequence = [];
  for (let k = 0; k < numColors; k++) {
    const currentColorValue = k + 1;
    const countForColor = colorCounts[k];
    for (let l = 0; l < countForColor; l++) {
      colorSequence.push(currentColorValue);
    }
  }

  let outputBuffer = '';
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    const isEvenRow = (rowIdx % 2 === 0);
    const rowStartOffset = rowIdx * gridWidth;
    const rowEndOffset = (rowIdx + 1) * gridWidth - 1;

    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      let currentCellValue;
      if (isEvenRow) {
        currentCellValue = colorSequence[rowStartOffset + colIdx];
      } else {
        currentCellValue = colorSequence[rowEndOffset - colIdx];
      }

      outputBuffer += currentCellValue;

      if (colIdx < gridWidth - 1) {
        outputBuffer += ' ';
      } else {
        outputBuffer += '\n';
      }
    }
  }

  outputBuffer = outputBuffer.slice(0, -1);

  console.log(outputBuffer);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
