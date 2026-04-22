function processData(rawContent) {
  const parsedLines = rawContent.split("\n").filter(lineItem => lineItem.length > 0);
  const targetString = parsedLines[0];

  let accumulatedPositions = 0;
  let whiteCharCount = 0;
  const charSeriesLength = targetString.length;

  for (let currentPosition = 0; currentPosition < charSeriesLength; currentPosition++) {
    if (targetString[currentPosition] === 'W') {
      accumulatedPositions += currentPosition;
      whiteCharCount++;
    }
  }

  let ordinalSumCorrection = 0;
  for (let sequenceIndex = 0; sequenceIndex < whiteCharCount; sequenceIndex++) {
    ordinalSumCorrection += sequenceIndex;
  }

  const finalOutcome = accumulatedPositions - ordinalSumCorrection;

  console.log(finalOutcome);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));