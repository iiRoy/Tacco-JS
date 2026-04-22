const processNumericalSequence = (inputString) => {
  const numericComponents = inputString.split('\n')[0].match(/\d+/g).map(Number.parseInt);

  const firstComponent = numericComponents[0];
  const secondComponent = numericComponents[1];
  const thirdComponent = numericComponents[2];

  const aggregatedTotal = firstComponent + secondComponent + thirdComponent;

  const greatestComponent = [firstComponent, secondComponent, thirdComponent].sort((valA, valB) => valB - valA)[0];

  const baseTripleOfGreatest = greatestComponent * 3;

  const totalParity = aggregatedTotal & 1;
  const tripleGreatestParity = baseTripleOfGreatest & 1;

  const parityDiscrepancy = totalParity ^ tripleGreatestParity;

  const adjustedTripleGreatest = baseTripleOfGreatest + (parityDiscrepancy * 3);

  const finalOutcome = (adjustedTripleGreatest - aggregatedTotal) >> 1;

  return finalOutcome;
};

const executeComputation = (inputData) => {
  console.log(processNumericalSequence(inputData));
};

executeComputation(require("node:fs").readFileSync("/dev/stdin", "utf8"));