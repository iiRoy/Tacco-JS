const evaluateYearForLeap = (yearCandidate) =>
  (yearCandidate % 4 === 0 && yearCandidate % 100 !== 0) || yearCandidate % 400 === 0;

const processInputLine = (lineSegment) => {
  const [startYearString, endYearString] = lineSegment.split(' ');
  const startYear = Number(startYearString);
  const endYear = Number(endYearString);

  const foundLeapYears = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
    .filter(evaluateYearForLeap);

  return foundLeapYears.length === 0
    ? "NA"
    : foundLeapYears.join('\n');
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawInputData.trim().split('\n');

const accumulatedOutputs = lineSegments.reduce((outputCollection, currentInputLine) => {
  if (currentInputLine === "0 0") {
    return outputCollection;
  }
  if (currentInputLine.trim() === "") {
    return outputCollection;
  }

  const currentLineResult = processInputLine(currentInputLine);

  if (outputCollection.length === 0) {
    return [currentLineResult];
  } else {
    return [...outputCollection, currentLineResult];
  }
}, []);

console.log(accumulatedOutputs.join('\n\n'));
