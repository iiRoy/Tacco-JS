const solveEquation = (inputString) => {
  const POWER_EXPONENT_VAL = 5n;
  const targetSumValue = BigInt(inputString.trim());

  const LOOP_ITERATION_LIMIT = 100n;

  const checkAndOutputSolution = (valA, valB, target, exponent) => {
    const valAPowered = valA ** exponent;
    const valBPowered = valB ** exponent;

    if (valAPowered - valBPowered === target) {
      console.log(`${valA} ${valB}`);
      return true;
    } else if (valAPowered + valBPowered === target) {
      console.log(`${valA} ${-valB}`);
      return true;
    }
    return false;
  };

  for (let currentA = 0n; currentA < LOOP_ITERATION_LIMIT; currentA++) {
    for (let currentB = 0n; currentB < LOOP_ITERATION_LIMIT; currentB++) {
      if (checkAndOutputSolution(currentA, currentB, targetSumValue, POWER_EXPONENT_VAL)) {
        return;
      }
    }
  }
};

const retrieveInputContent = (filePath) => {
  const fileSystemModule = require('fs');
  return fileSystemModule.readFileSync(filePath, 'utf8');
};

const DEVELOPMENT_INPUT_PATH = 'dev/stdin';
const PRODUCTION_INPUT_PATH = '/dev/stdin';
const TEST_ENVIRONMENT_KEY = 'test';

const environmentVariableValue = process.env.MYTEST;

if (environmentVariableValue) {
  if (environmentVariableValue === TEST_ENVIRONMENT_KEY) {
    test();
  } else {
    const inputDataForDev = retrieveInputContent(DEVELOPMENT_INPUT_PATH);
    solveEquation(inputDataForDev);
  }
} else {
  const inputDataForProd = retrieveInputContent(PRODUCTION_INPUT_PATH);
  solveEquation(inputDataForProd);
}
