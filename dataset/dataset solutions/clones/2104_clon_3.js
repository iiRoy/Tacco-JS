const processInput = (dataLines) => {
  const numStrings = dataLines[0].split(" ");
  const targetValA = Number(numStrings[0]);
  const targetValB = Number(numStrings[1]);

  let finalResult = -1;
  let currentIdx = 0;

  const verifyMatch = (idx, valA, valB) => {
    const calculatedA = Math.floor(idx * 0.08);
    const calculatedB = Math.floor(idx * 0.1);
    return calculatedA === valA && calculatedB === valB;
  };

  const maxIterationLimit = (targetValB + 1) * 10;

  while (currentIdx <= maxIterationLimit) {
    if (verifyMatch(currentIdx, targetValA, targetValB)) {
      finalResult = currentIdx;
      break;
    }
    currentIdx++;
  }
  console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
