function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  var countItems = parseInt(rawData[0]);
  rawData.shift();
  rawData.splice(countItems, rawData.length);
  var dataPoints = rawData.map(function(lineSegment) {
    return lineSegment.split(" ").map(function(numericString) {
      return parseInt(numericString);
    });
  });
  dataPoints.sort(function(firstElement, secondElement) {
    return firstElement[0] - secondElement[0];
  });
  var finalResult = 1;
  var currentMaxReach = dataPoints[0][0] + dataPoints[0][1];
  for (var idx = 1; idx < countItems; idx++) {
    if (currentMaxReach > dataPoints[idx][0] - dataPoints[idx][1]) {
      currentMaxReach = Math.min(currentMaxReach, dataPoints[idx][0] + dataPoints[idx][1]);
    } else {
      finalResult++;
      currentMaxReach = dataPoints[idx][0] + dataPoints[idx][1];
    }
  }
  console.log('%s', finalResult);
  return finalResult;
}

function testSolution(testCaseNum) {
  var testInput = document.getElementById("input" + testCaseNum).value;
  var computedAnswer = ProcessInput(testInput);
  var testOutcome = "WA";
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC";
  }
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
