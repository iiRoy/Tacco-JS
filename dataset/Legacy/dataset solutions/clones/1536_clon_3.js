const processInput = (rawData) => {
  const moduloConstant = 10**9 + 7;
  const targetSum = Number(rawData.trim());

  const dynamicProgrammingTable = new Array(targetSum + 1).fill(0);
  dynamicProgrammingTable[0] = 1;

  const tableUpperLimit = dynamicProgrammingTable.length;

  for (let currentSum = 1; currentSum < tableUpperLimit; currentSum++) {
    if (currentSum >= 3) {
      const valueFromPreviousStep = dynamicProgrammingTable[currentSum - 1];
      const valueFromThreeStepsBack = dynamicProgrammingTable[currentSum - 3];
      dynamicProgrammingTable[currentSum] = (valueFromPreviousStep + valueFromThreeStepsBack) % moduloConstant;
    }
  }

  const finalComputedValue = (dynamicProgrammingTable[targetSum] % moduloConstant + moduloConstant) % moduloConstant;
  console.log(finalComputedValue);
};

const getFileContent = (pathIdentifier) => {
  return require('fs').readFileSync(pathIdentifier, 'utf8');
};

if (process.env.MYTEST) {
  if (process.env.MYTEST === 'test') {
    test();
  } else {
    const inputData = getFileContent('dev/stdin');
    processInput(inputData);
  }
} else {
  const inputData = getFileContent('/dev/stdin');
  processInput(inputData);
}
