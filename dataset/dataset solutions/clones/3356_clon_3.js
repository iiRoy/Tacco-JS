function parseInteger(str) {
  return parseInt(str, 10);
}

function calculatePotentialMax(currentValue, currentHeight, maxValuesArray) {
  const existingValueAtHeight = maxValuesArray[currentHeight];
  return currentValue + existingValueAtHeight;
}

function updateMaxValuesRange(startHeight, endHeightExclusive, potentialValue, dpArray) {
  for (let k = startHeight; k < endHeightExclusive; k++) {
    if (potentialValue > dpArray[k]) {
      dpArray[k] = potentialValue;
    } else {
      break;
    }
  }
}

function ProcessInput(rawData) {
  const processedLines = rawData.split("\n");
  const itemCount = parseInteger(processedLines[0]);
  const heightStrings = processedLines[1].split(" ");
  const valueStrings = processedLines[2].split(" ");

  const maxValues = Array.from({ length: itemCount + 1 }, () => 0);

  let finalResult = 0;

  for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
    const currentValue = parseInteger(valueStrings[currentIndex]);
    const currentHeight = parseInteger(heightStrings[currentIndex]);

    const potentialNewMax = calculatePotentialMax(currentValue, currentHeight, maxValues);

    updateMaxValuesRange(currentHeight, itemCount + 1, potentialNewMax, maxValues);

    finalResult = Math.max(finalResult, maxValues[currentHeight]);
  }

  console.log('%s', finalResult);
  return finalResult;
}

function runTestScenario(scenarioIndex) {
  const scenarioInput = document.getElementById("input" + scenarioIndex).value;
  const computedAnswer = ProcessInput(scenarioInput);
  let testStatus = "WA";
  if (computedAnswer == document.getElementById("output" + scenarioIndex).value.split("\n")[0]) {
    testStatus = "AC";
  }
  document.getElementById("result" + scenarioIndex).innerHTML = testStatus;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
