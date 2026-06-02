const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
const inputLines = rawInputContent.split('\n');

function computeMinSum(targetValue) {
  let currentMinSum = Number.POSITIVE_INFINITY;
  let y_val = 0;
  while (y_val * y_val <= targetValue) {
    let z_val = 0;
    const remainingAfterY = targetValue - y_val * y_val;
    while (z_val * z_val * z_val <= remainingAfterY) {
      const x_val = remainingAfterY - z_val * z_val * z_val;
      const currentSum = x_val + y_val + z_val;
      if (currentSum < currentMinSum) {
        currentMinSum = currentSum;
      }
      z_val++;
    }
    y_val++;
  }
  return currentMinSum;
}

function processInputSegment(remainingLines, currentLineIndex = 0) {
  if (currentLineIndex >= remainingLines.length) {
    return;
  }

  const currentNumericValue = Number(remainingLines[currentLineIndex]);

  if (currentNumericValue === 0) {
    return;
  }

  console.log(computeMinSum(currentNumericValue));

  processInputSegment(remainingLines, currentLineIndex + 1);
}

processInputSegment(inputLines);
