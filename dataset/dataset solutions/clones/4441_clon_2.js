function ProcessInput(rawData) {
  const processedLines = rawData.split("\n");

  const dimensionsLine = processedLines[0].split(" ");
  const heightVal = parseInt(dimensionsLine[0]);
  const widthVal = parseInt(dimensionsLine[1]);

  const numSections = parseInt(processedLines[1]);

  const tempSectionData = processedLines[2].split(" ");

  let outputElements = [];
  for (let idxBlock = 0; idxBlock < numSections; idxBlock++) {
    const blockCount = parseInt(tempSectionData[idxBlock]);
    for (let idxRepetition = 0; idxRepetition < blockCount; idxRepetition++) {
      outputElements.push(idxBlock + 1);
    }
  }

  let finalOutputString = "";
  let rowStrings = Array(heightVal).fill("");

  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    rowStrings[rowIdx] = outputElements[rowIdx * widthVal];
    for (let colIdx = 1; colIdx < widthVal; colIdx++) {
      if ((rowIdx % 2) === 0) {
        rowStrings[rowIdx] = rowStrings[rowIdx] + " " + outputElements[rowIdx * widthVal + colIdx];
      } else {
        rowStrings[rowIdx] = outputElements[rowIdx * widthVal + colIdx] + " " + rowStrings[rowIdx];
      }
    }
    rowStrings[rowIdx] = rowStrings[rowIdx] + "\n";
    finalOutputString += rowStrings[rowIdx];
  }

  if (finalOutputString.slice(-1) === "\n") {
    finalOutputString = finalOutputString.slice(0, -1);
  }

  console.log('%s', finalOutputString);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));