const processInput = (inputData) => {
  const moduloConstant = 998244353n;
  const [firstLineData, ...queryLines] = inputData.trim().split('\n');
  const [targetValue] = firstLineData.split(' ').map(Number);

  const uniqueStepsSet = new Set();
  for (let queryIndex = 0; queryIndex < queryLines.length; queryIndex++) {
    const [rangeStart, rangeEnd] = queryLines[queryIndex].split(' ').map(Number);
    for (let currentNum = rangeStart; currentNum <= rangeEnd; currentNum++) {
      uniqueStepsSet.add(currentNum);
    }
  }

  const allowedSteps = Array.from(uniqueStepsSet).sort((valA, valB) => valA - valB);

  const pathCounts = new Array(targetValue + 1).fill(0n);
  pathCounts[1] = 1n;

  for (let currentPosition = 2; currentPosition <= targetValue; currentPosition++) {
    let currentSum = 0n;
    for (let stepIndex = 0; stepIndex < allowedSteps.length; stepIndex++) {
      const stepSize = allowedSteps[stepIndex];
      const previousPosition = currentPosition - stepSize;

      if (previousPosition >= 1) {
        currentSum += pathCounts[previousPosition];
      } else {
        break;
      }
    }
    pathCounts[currentPosition] = currentSum;
  }

  const finalResult = (pathCounts[targetValue] % moduloConstant + moduloConstant) % moduloConstant;
  console.log(`${finalResult}`);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
