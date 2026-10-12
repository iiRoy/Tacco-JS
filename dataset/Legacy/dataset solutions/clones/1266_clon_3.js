function ProcessInput(rawData) {
  const inputLines = rawData.trim().split("\n");

  const totalLines = inputLines.length;

  const generateAlternatingPatterns = (patternWidth) => {
    let primaryPattern = "";
    let secondaryPattern = "";
    for (let colIter = 0; colIter < patternWidth; colIter++) {
      const isEvenColumn = (colIter % 2 === 0);
      if (isEvenColumn) {
        primaryPattern += "#";
        secondaryPattern += ".";
      } else {
        primaryPattern += ".";
        secondaryPattern += "#";
      }
    }
    return { primary: primaryPattern, secondary: secondaryPattern };
  };

  for (let currentLineIdx = 0; currentLineIdx < totalLines; currentLineIdx++) {
    const parsedDimensions = inputLines[currentLineIdx].split(" ").map((valStr) => Number(valStr));
    const [currentHeight, currentWidth] = parsedDimensions;

    if (currentHeight === 0 && currentWidth === 0) {
      break;
    }

    const { primary: firstRowPattern, secondary: secondRowPattern } = generateAlternatingPatterns(currentWidth);

    for (let rowIter = 0; rowIter < currentHeight; rowIter++) {
      const isEvenRow = (rowIter % 2 === 0);
      if (isEvenRow) {
        console.log(firstRowPattern);
      } else {
        console.log(secondRowPattern);
      }
    }
    console.log();
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
