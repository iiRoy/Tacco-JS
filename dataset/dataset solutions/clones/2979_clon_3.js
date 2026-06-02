process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputDataLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputDataLines.push(currentLine);
});

inputReader.on('close', () => {
  let solutionCount = 0;

  const parseNumericValue = (strArray, index) => {
    return Number(strArray[index]);
  };

  const firstLineParts = inputDataLines[0].split(" ");

  const redVal = parseNumericValue(firstLineParts, 0);
  const greenVal = parseNumericValue(firstLineParts, 1);
  const blueVal = parseNumericValue(firstLineParts, 2);
  const maxSum = parseNumericValue(firstLineParts, 3);

  for (let idxR = 0; idxR * redVal <= maxSum; idxR++) {
    for (let idxG = 0; idxG * greenVal <= maxSum; idxG++) {
      const currentCombinationSum = redVal * idxR + greenVal * idxG;
      const remainingTargetSum = maxSum - currentCombinationSum;

      if (remainingTargetSum % blueVal === 0 && remainingTargetSum >= 0) {
        solutionCount++;
      } else if (currentCombinationSum > maxSum) {
        break;
      }
    }
  }
  console.log(solutionCount);
});
