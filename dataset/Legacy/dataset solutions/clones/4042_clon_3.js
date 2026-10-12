function convertStringArrayToNumberArray(stringValues) {
  return stringValues.map(function(strVal) {
    return parseInt(strVal, 10);
  });
}

function calculateTotalDifference(elementCount, firstArray, secondArray) {
  let accumulatedDifference = 0;
  for (let loopIdx = 0; loopIdx < elementCount; loopIdx++) {
    const valFromFirst = firstArray[loopIdx];
    const valFromSecond = secondArray[loopIdx];
    const currentDiff = valFromSecond - valFromFirst;
    accumulatedDifference += currentDiff;
  }
  return accumulatedDifference;
}

function getParityOutput(valueToCheck) {
  const PARITY_MODULO_DIVISOR = 2;
  const ODD_REMAINDER = 1;

  if (valueToCheck % PARITY_MODULO_DIVISOR === ODD_REMAINDER) {
    return "Yes";
  } else {
    return "No";
  }
}

function ProcessInputData(rawInputData) {
  const inputLines = rawInputData.split('\n');

  const numberOfElements = parseInt(inputLines[0], 10);

  const stringArrayOne = inputLines[1].split(' ');
  const stringArrayTwo = inputLines[2].split(' ');

  const numericArrayOne = convertStringArrayToNumberArray(stringArrayOne);
  const numericArrayTwo = convertStringArrayToNumberArray(stringArrayTwo);

  const finalDifferenceSum = calculateTotalDifference(numberOfElements, numericArrayOne, numericArrayTwo);

  const outputMessage = getParityOutput(finalDifferenceSum);

  console.log("%s", outputMessage);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
