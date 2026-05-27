function processInputData(sourceContent) {
  const parsedLines = sourceContent.split("\n").map(lineSegment => lineSegment.split(" "));
  const targetDivisor = Number(parsedLines[0][0]);

  function* produceTriangularNumbers() {
    let currentSummation = 0;
    let currentOrdinal = 0;
    while (true) {
      currentOrdinal++;
      currentSummation += currentOrdinal;
      yield { sum: currentSummation, ordinal: currentOrdinal };
    }
  }

  const triangularSequence = produceTriangularNumbers();
  let resultingOrdinal;

  for (const element of triangularSequence) {
    if (element.sum % targetDivisor === 0) {
      resultingOrdinal = element.ordinal;
      break;
    }
  }

  console.log(resultingOrdinal);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
