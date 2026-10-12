const fs = require("fs");

const readInputFile = () => {
  const fileContentBuffer = fs.readFileSync("/dev/stdin", "utf8");
  const trimmedContent = fileContentBuffer.trim();
  return trimmedContent.split("\n");
};

const inputLines = readInputFile();
let currentLineIndex = 0;

const getString = () => inputLines[currentLineIndex++];
const getNumber = () => Number(getString());
const getBigInt = () => BigInt(getString());
const getStringArray = () => getString().split(' ');
const getNumberArray = () => getStringArray().map(Number);
const getBigIntArray = () => getStringArray().map(BigInt);

function calculatePairs(valueForPairs) {
  if (valueForPairs < 2) {
    return 0;
  }
  const decrementedValue = valueForPairs - 1;
  const productOfValues = valueForPairs * decrementedValue;
  const result = productOfValues / 2;
  return result;
}

function processInput(allInputLines) {
  const parsedNumericValues = getNumberArray();
  const firstVal = parsedNumericValues[0];
  const secondVal = parsedNumericValues[1];

  const pairsFromFirstVal = calculatePairs(firstVal);
  const pairsFromSecondVal = calculatePairs(secondVal);

  const finalResult = pairsFromFirstVal + pairsFromSecondVal;
  
  return finalResult;
}

const calculatedOutput = processInput(inputLines);
console.log(calculatedOutput);
