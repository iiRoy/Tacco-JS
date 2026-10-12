function processInputData(rawData) {
  const lines = rawData.split("\n");

  const [gridHeightStr, gridWidthStr] = lines[0].split(" ");
  const gridHeight = parseInt(gridHeightStr, 10);
  const gridWidth = parseInt(gridWidthStr, 10);

  const numColorTypes = parseInt(lines[1], 10);

  const colorCountsString = lines[2].split(" ");
  const colorCountsArray = colorCountsString.map(Number);

  const colorFillSequence = [];
  colorCountsArray.forEach((currentTypeCount, colorTypeIndex) => {
    for (let fillIteration = 0; fillIteration < currentTypeCount; fillIteration++) {
      colorFillSequence.push(colorTypeIndex + 1);
    }
  });

  const gridRowStrings = [];
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const startIndex = rowIndex * gridWidth;
    const endIndex = startIndex + gridWidth;
    let currentRowElements = colorFillSequence.slice(startIndex, endIndex);

    // For odd rows, the elements are filled from right to left
    if (rowIndex % 2 !== 0) {
      currentRowElements.reverse();
    }
    
    gridRowStrings.push(currentRowElements.join(" "));
  }

  const finalGridOutput = gridRowStrings.join("\n");
  console.log(finalGridOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
