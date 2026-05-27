function parseNumericInput(rawInputString) {
  const stringParts = rawInputString.split(" ");
  const numericArray = stringParts.map(part => Number(part));
  return numericArray;
}

function checkThresholdCondition(valueA, valueB) {
  const fixedFactor = 500;
  const multipliedValue = valueA * fixedFactor;
  const isConditionMet = multipliedValue >= valueB;
  return isConditionMet;
}

function processDataEntry(inputContentString) {
  const parsedNumbers = parseNumericInput(inputContentString);

  const firstNumericValue = parsedNumbers[0];
  const secondNumericValue = parsedNumbers[1];

  const resultFlag = checkThresholdCondition(firstNumericValue, secondNumericValue);

  if (resultFlag) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
