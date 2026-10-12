function parseLineOfNumbers(lineContent) {
  return lineContent.trim().split(" ").map(str => parseInt(str));
}

function processInput(inputData) {
  const firstLineValues = parseLineOfNumbers(inputData[0]);
  const targetValue = firstLineValues[0];
  const numForbidden = firstLineValues[1];

  if (numForbidden === 0) {
    console.log(targetValue);
    return;
  }

  const forbiddenValuesArray = parseLineOfNumbers(inputData[1]);
  const forbiddenValuesSet = new Set(forbiddenValuesArray);

  for (let currentOffset = 0; ; currentOffset++) {
    const lowerCandidate = targetValue - currentOffset;
    const upperCandidate = targetValue + currentOffset;

    if (!forbiddenValuesSet.has(lowerCandidate)) {
      console.log(lowerCandidate);
      break;
    }

    if (!forbiddenValuesSet.has(upperCandidate)) {
      console.log(upperCandidate);
      break;
    }
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
