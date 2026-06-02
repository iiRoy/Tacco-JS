function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(outputValue) {
  console.log(outputValue);
}

function printError(errorMessage) {
  console.error(errorMessage);
}

// Helper to convert string to number
const convertToNumber = (str) => Number(str);

// Object mapping for different input conversion types
const inputConversionStrategies = {
  0: (inputString) => inputString,
  1: (inputString) => parseInt(inputString),
  2: (inputString) => inputString.split(" "),
  3: (inputString) => inputString.split("\n"),
  4: (inputString) => inputString.split(" ").map(convertToNumber),
  5: (inputString) => inputString.split("\n").map(convertToNumber),
  6: (inputString) => inputString.split(""),
  7: (inputString) => inputString.split("").map(convertToNumber),
};

function convertInput(inputString, conversionType) {
  const strategy = inputConversionStrategies[conversionType];
  if (strategy) {
    return strategy(inputString);
  }
  // Fallback to original case 0 behavior if type is unknown, preserving original behavior
  return inputString;
}

// Helper function to get parity (0 for even, 1 for odd)
function getParity(num) {
  return num % 2;
}

// Helper function to check if three numbers all have the same parity
function haveSameParity(num1, num2, num3) {
  const parity1 = getParity(num1);
  const parity2 = getParity(num2);
  const parity3 = getParity(num3);
  return parity1 === parity2 && parity1 === parity3;
}

function ProcessMain(rawInputData) {
  // Convert and sort the input numbers
  let processedNumbers = convertInput(rawInputData, 4);
  processedNumbers.sort((firstElem, secondElem) => firstElem - secondElem);

  // Assign to distinct variables for clarity and modification
  let valueA = processedNumbers[0];
  let valueB = processedNumbers[1];
  let valueC = processedNumbers[2];

  let operationCount = 0;

  // If not all numbers have the same parity, adjust two of them.
  // This step ensures all three numbers will have the same parity.
  // This operation counts as one step.
  if (!haveSameParity(valueA, valueB, valueC)) {
    if (getParity(valueA) === getParity(valueB)) {
      valueA++;
      valueB++;
    } else if (getParity(valueA) === getParity(valueC)) {
      valueA++;
      valueC++;
    } else { // Implies getParity(valueB) === getParity(valueC)
      valueB++;
      valueC++;
    }
    operationCount++;
  }

  // Determine the maximum value among the (potentially adjusted) numbers
  const currentMaxValue = Math.max(valueA, valueB, valueC);

  // Calculate the total difference needed to bring all numbers to the maximum value.
  // Since all numbers now have the same parity, (currentMaxValue - valueX) will always be even.
  // Each operation increments two numbers by 1, effectively reducing the total difference by 2.
  // So, the number of operations is half of the total difference.
  const diffFromA = currentMaxValue - valueA;
  const diffFromB = currentMaxValue - valueB;
  const diffFromC = currentMaxValue - valueC;

  const totalDifference = diffFromA + diffFromB + diffFromC;
  operationCount += totalDifference / 2;

  printOutput(operationCount);
}

// Entry point for the program
ProcessMain(readInput());
