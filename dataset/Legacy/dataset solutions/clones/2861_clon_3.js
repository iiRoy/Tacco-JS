function parseInputData(rawData, shouldParseInt = false) {
  const parsedLines = [];
  const inputRows = rawData.split('\n');

  const splitRowContent = (rowString) => rowString.split(' ');

  for (let rowIdx = 0; rowIdx < inputRows.length; rowIdx++) {
    const currentRowString = inputRows[rowIdx];
    let processedRowData;
    if (shouldParseInt) {
      processedRowData = splitRowContent(currentRowString).map(itemStr => parseInt(itemStr, 10));
    } else {
      processedRowData = splitRowContent(currentRowString);
    }
    parsedLines.push(processedRowData);
  }
  return parsedLines;
}

function initializeDynamicProgrammingArray(arraySize, initialValue) {
  const requiredArrayLength = arraySize + 2;
  return Array(requiredArrayLength).fill(initialValue);
}

function processInputAndSolve(problemInput) {
  const MODULO_CONSTANT = 1000000007;

  const parsedInputData = parseInputData(problemInput, true);
  const totalSteps = parsedInputData[0][0];
  
  const forbiddenStepsList = parsedInputData.slice(1).map(line => line[0]);

  const dpTable = initializeDynamicProgrammingArray(totalSteps, 0);
  dpTable[0] = 1;
  
  for (let currentStep = 1; currentStep <= totalSteps; currentStep++) {
    if (forbiddenStepsList.length > 0 && forbiddenStepsList[0] === currentStep) {
      forbiddenStepsList.shift();
      continue;
    }
    
    let waysToReachCurrentStep = 0;

    // Add ways from the previous step (currentStep - 1)
    waysToReachCurrentStep = (waysToReachCurrentStep + dpTable[currentStep - 1]) % MODULO_CONSTANT;

    // Add ways from two steps back (currentStep - 2)
    if (currentStep >= 2) {
      waysToReachCurrentStep = (waysToReachCurrentStep + dpTable[currentStep - 2]) % MODULO_CONSTANT;
    }
    
    dpTable[currentStep] = waysToReachCurrentStep;
  }

  console.log(dpTable[totalSteps]);
}

const inputFromFile = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndSolve(inputFromFile);
