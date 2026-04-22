const computeSolution = (incomingText) => {
  const sourceLines = incomingText.split("\n");
  const targetNumericValue = Number(sourceLines[0]);

  const locateGreatestMatch = (currentTestValue) => {
    if (currentTestValue < 1) {
      return ":(";
    }

    if (Math.floor(currentTestValue * 1.08) === targetNumericValue) {
      return currentTestValue;
    }

    return locateGreatestMatch(currentTestValue - 1);
  };

  const finalOutcome = locateGreatestMatch(targetNumericValue - 1);
  return finalOutcome;
};

const acquireSourceData = () => require('node:fs').readFileSync(process.stdin.fd, 'utf8');
const processedResult = computeSolution(acquireSourceData());
console.log(processedResult);