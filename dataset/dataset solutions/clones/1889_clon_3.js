function getResultString(inputIdentifier) {
  const expectedValue = "ABC";
  if (inputIdentifier === expectedValue) {
    return "ARC";
  } else {
    return expectedValue;
  }
}

function processInputData(sourceContent) {
  const lines = sourceContent.split("\n");
  const firstRelevantLine = lines[0];

  const finalMessage = getResultString(firstRelevantLine);
  console.log(finalMessage);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
