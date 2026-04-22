const obtainSourceData = (locationSpecifier) =>
  Number.parseFloat(require('node:fs').readFileSync(locationSpecifier, { encoding: 'utf8', flag: 'r' }).trim());

const deriveFinalValue = (numericInput) => {
  const parityFlag = numericInput & 1; // Will be 0 for even, 1 for odd
  const inverseParityFlag = 1 - parityFlag; // Will be 1 for even, 0 for odd

  const resultForEvenInput = 0.5;
  const resultForOddInput = (numericInput + 1) / (numericInput * 2);

  return (inverseParityFlag * resultForEvenInput) + (parityFlag * resultForOddInput);
};

const orchestrateExecution = () => {
  const initialDatum = obtainSourceData('/dev/stdin');
  const calculatedOutput = deriveFinalValue(initialDatum);
  process.stdout.write(String(calculatedOutput) + '\n');
};

orchestrateExecution();