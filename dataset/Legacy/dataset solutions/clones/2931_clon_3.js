function processInputData(rawData) {
  const parseNumericValue = (inputString) => parseInt(inputString, 10);

  let lines = rawData.split("\n");

  let parameterLine = lines[0];

  let parameterStrings = parameterLine.split(" ");

  let rateFactor = parseNumericValue(parameterStrings[0]);
  let decrementValue = parseNumericValue(parameterStrings[1]);
  let currentValue = parseNumericValue(parameterStrings[2]);

  const ITERATION_COUNT = 10;

  for (let iterationIndex = 0; iterationIndex < ITERATION_COUNT; iterationIndex++) {
    currentValue = (rateFactor * currentValue) - decrementValue;
    console.log(currentValue);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
