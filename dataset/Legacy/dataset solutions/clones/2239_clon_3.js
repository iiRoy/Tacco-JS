function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const itemCount = parseInt(inputLines[0], 10);

  const dataLines = inputLines.slice(1, itemCount + 1);

  const parseLineToNumbers = (lineContent) => {
    return lineContent.split(" ").map(Number);
  };

  const dataPoints = dataLines.map(parseLineToNumbers);

  dataPoints.sort((pointA, pointB) => pointA[0] - pointB[0]);

  let resultCount = 1;

  let currentMaxReach = dataPoints[0][0] + dataPoints[0][1];

  for (let idx = 1; idx < itemCount; idx++) {
    const currentPoint = dataPoints[idx];
    const currentX = currentPoint[0];
    const currentY = currentPoint[1];

    const currentLeftBound = currentX - currentY;
    const currentRightBound = currentX + currentY;

    if (currentMaxReach > currentLeftBound) {
      currentMaxReach = Math.min(currentMaxReach, currentRightBound);
    } else {
      resultCount++;
      currentMaxReach = currentRightBound;
    }
  }

  console.log('%s', resultCount);
  return resultCount;
}

function validateTestScenario(scenarioId) {
  const inputElement = document.getElementById("input" + scenarioId);
  const outputElement = document.getElementById("output" + scenarioId);
  const resultElement = document.getElementById("result" + scenarioId);

  const scenarioInputText = inputElement.value;
  const computedResult = processInputData(scenarioInputText);

  let validationStatus = "WA";
  const expectedOutputValue = outputElement.value.split("\n")[0];

  if (computedResult.toString() === expectedOutputValue) {
    validationStatus = "AC";
  }

  resultElement.innerHTML = validationStatus;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
