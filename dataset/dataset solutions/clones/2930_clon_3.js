function ProcessInput(rawData) {
  let inputLines = rawData.split("\n");
  let firstLineData = inputLines[0].split(" ");

  let rateFactor = parseInt(firstLineData[0]);
  let offsetValue = parseInt(firstLineData[1]);
  let initialValue = parseInt(firstLineData[2]);

  let currentCalculatedValue = initialValue;
  let resultSequence = [];

  for (let sequenceIndex = 0; sequenceIndex < 10; sequenceIndex++) {
    let nextTerm = currentCalculatedValue * rateFactor - offsetValue;
    resultSequence.push(nextTerm);
    currentCalculatedValue = nextTerm;
  }

  let finalOutputString = resultSequence.join("\n");

  console.log(finalOutputString);
  return finalOutputString;
}

function testFunction(testCaseId) {
  const inputElementIdentifier = "input" + testCaseId;
  const outputElementIdentifier = "output" + testCaseId;
  const resultElementIdentifier = "result" + testCaseId;

  let testInputData = document.getElementById(inputElementIdentifier).value;
  let computedResult = ProcessInput(testInputData);

  let expectedResult = document.getElementById(outputElementIdentifier).value.split("\n")[0];

  let testOutcomeStatus = "WA";
  if (computedResult === expectedResult) {
    testOutcomeStatus = "AC";
  }

  document.getElementById(resultElementIdentifier).innerHTML = testOutcomeStatus;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
