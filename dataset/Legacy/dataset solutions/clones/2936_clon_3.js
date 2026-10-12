function processInputData(sourceData) {
  const dataLines = sourceData.split("\n");

  const firstLineParts = dataLines[0].split(" ");
  const itemCount = parseInt(firstLineParts[0], 10);
  const numRanges = parseInt(firstLineParts[1], 10);

  const leftBoundaryList = [];
  const rightBoundaryList = [];

  for (let k = 0; k < numRanges; k++) {
    const currentLineIndex = k + 1;
    const rangeParts = dataLines[currentLineIndex].split(" ");
    leftBoundaryList.push(parseInt(rangeParts[0], 10));
    rightBoundaryList.push(parseInt(rangeParts[1], 10));
  }

  let overallMaxLeft = leftBoundaryList[0];
  let overallMinRight = rightBoundaryList[0];

  for (let k = 1; k < numRanges; k++) {
    const currentLeft = leftBoundaryList[k];
    const currentRight = rightBoundaryList[k];

    if (currentLeft > overallMaxLeft) {
      overallMaxLeft = currentLeft;
    }
    if (currentRight < overallMinRight) {
      overallMinRight = currentRight;
    }
  }

  const intersectionResult = overallMinRight - overallMaxLeft + 1;

  console.log(intersectionResult);
}

processInputData(require("fs").readFileSync("./inputdata.txt", "utf8"));
