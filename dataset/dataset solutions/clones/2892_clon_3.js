function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const charSequence = inputLines[0].split("");
  let xOccurrenceCount = 0;

  charSequence.forEach(function(currentChar) {
    if (currentChar === "x") {
      xOccurrenceCount++;
    }
  });

  let finalResult = "NO";
  const isCountWithinLimit = xOccurrenceCount <= 7;

  if (isCountWithinLimit) {
    finalResult = "YES";
  }

  console.log('%s', finalResult);
  return finalResult;
}

function evaluateSolution(testCaseIdentifier) {
  const getElementByIdRef = (idString) => document.getElementById(idString);

  const testInputContent = getElementByIdRef("input" + testCaseIdentifier).value;
  const actualOutput = processInputData(testInputContent);

  const expectedOutputLine = getElementByIdRef("output" + testCaseIdentifier).value.split("\n")[0];

  const evaluationStatus = (actualOutput === expectedOutputLine) ? "AC" : "WA";

  getElementByIdRef("result" + testCaseIdentifier).innerHTML = evaluationStatus;
}

const fileSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileSystemInput);
