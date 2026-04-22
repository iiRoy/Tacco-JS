const fileSystem = require('node:fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const analyzeCircleConfiguration = (dataLine) => {
  const numericValues = dataLine.split(' ').map(parseFloat);

  const [
    c1x,
    c1y,
    r1,
    c2x,
    c2y,
    r2,
  ] = numericValues;

  const dx = c2x - c1x;
  const dy = c2y - c1y;

  const distCenters = Math.hypot(dx, dy);

  const radiiSum = r1 + r2;

  let relationshipCode;

  // Check for external separation
  if (distCenters > radiiSum) {
    relationshipCode = 0;
  }
  // Check for first circle strictly inside second (r1 contained in r2)
  // This is equivalent to d < r2 - r1
  else if (distCenters < r2 - r1) {
    relationshipCode = -2;
  }
  // Check for second circle strictly inside first (r2 contained in r1)
  // This is equivalent to d < r1 - r2
  else if (distCenters < r1 - r2) {
    relationshipCode = 2;
  }
  // All other cases imply intersection, external tangency, or internal tangency
  else {
    relationshipCode = 1;
  }

  return relationshipCode;
};

const allInputLines = rawInput.trim().split('\n');
const totalTestCases = parseInt(allInputLines[0], 10);

const testDataEntries = allInputLines.slice(1);

const finalResults = testDataEntries.slice(0, totalTestCases).map(analyzeCircleConfiguration);

console.log(finalResults.join('\n'));