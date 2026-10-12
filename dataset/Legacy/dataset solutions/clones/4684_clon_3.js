const parseNumericInput = (valueString) => {
  return parseInt(valueString, 10);
};

const findLastSummingNumber = (limitValue) => {
  const initialAccumulatorValue = 0;
  let currentAccumulatedSum = initialAccumulatorValue;
  let lastRelevantNumber = initialAccumulatorValue;
  let iterationCounter = initialAccumulatorValue;

  while (currentAccumulatedSum < limitValue) {
    currentAccumulatedSum += iterationCounter;
    lastRelevantNumber = iterationCounter;
    iterationCounter++;
  }
  return lastRelevantNumber;
};

function processInput(rawData) {
  const targetNumericValue = parseNumericInput(rawData);
  const finalCalculatedNumber = findLastSummingNumber(targetNumericValue);
  console.log('%s', finalCalculatedNumber);
}

function testExecution() {
  const inputElementIdentifier = "input";
  const inputHtmlElement = document.getElementById(inputElementIdentifier);
  const elementValue = inputHtmlElement.value;
  processInput(elementValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
