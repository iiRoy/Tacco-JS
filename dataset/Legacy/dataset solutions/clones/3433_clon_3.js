function computeFactorial(numVal) {
  let factResult = 1;
  let currentMultiplier = 1;
  while (currentMultiplier <= numVal) {
    factResult *= currentMultiplier;
    currentMultiplier++;
  }
  return factResult;
}

function checkDivisorCount(targetNum, upperLimit) {
  if (targetNum <= 0) {
    return 0;
  }
  let divCount = 0;
  for (let divIter = 1; divIter < upperLimit; divIter++) {
    const isDivisible = (targetNum % divIter === 0);
    if (isDivisible) {
      divCount++;
    }
  }
  return divCount;
}

function executeProgram(inputData) {
  const rawInputLine = inputData.split("\n")[0];
  const parsedNumericInput = Number(rawInputLine);

  let finalCount = 0;

  let calculatedFactorialN = computeFactorial(parsedNumericInput);

  for (let mainLoopIndex = 1; mainLoopIndex < calculatedFactorialN; mainLoopIndex++) {
    const isFactorOfCalculatedN = (calculatedFactorialN % mainLoopIndex === 0);
    if (isFactorOfCalculatedN) {
      const currentDivisorCount = checkDivisorCount(mainLoopIndex, calculatedFactorialN);
      if (currentDivisorCount === 75) {
        finalCount++;
      }
    }
  }

  console.log(finalCount);
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
