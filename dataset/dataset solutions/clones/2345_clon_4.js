function processInput(sourceData) {
  const primaryString = sourceData[0];
  const stringLength = primaryString.length;

  const differenceCount = Array.from({ length: Math.floor(stringLength / 2) }).reduce((currentTally, _, charIndex) => {
    const frontChar = primaryString[charIndex];
    const backChar = primaryString[stringLength - 1 - charIndex];
    return currentTally + (frontChar !== backChar ? 1 : 0);
  }, 0);

  console.log(differenceCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
