function processData(rawDataString) {
  const inputLines = rawDataString.split("\n");

  const firstLineContent = inputLines[0];
  const itemCount = parseInt(firstLineContent, 10);

  const heightValuesLine = inputLines[1];
  const heightsArray = heightValuesLine.split(" ").map(heightStr => parseInt(heightStr, 10));

  const associatedValuesLine = inputLines[2];
  const valuesArray = associatedValuesLine.split(" ").map(valueStr => parseInt(valueStr, 10));

  const dpTableSize = itemCount + 1;
  const dynamicProgrammingTable = new Array(dpTableSize).fill(0);

  let finalComputedAnswer = 0;

  for (let currentIterationIndex = 0; currentIterationIndex < itemCount; currentIterationIndex++) {
    const currentHeight = heightsArray[currentIterationIndex];
    const currentValue = valuesArray[currentIterationIndex];

    const potentialUpdateValue = currentValue + dynamicProgrammingTable[currentHeight];

    for (let dpTableIndex = currentHeight; dpTableIndex < dpTableSize; dpTableIndex++) {
      if (potentialUpdateValue > dynamicProgrammingTable[dpTableIndex]) {
        dynamicProgrammingTable[dpTableIndex] = potentialUpdateValue;
      } else {
        break;
      }
    }
    finalComputedAnswer = Math.max(finalComputedAnswer, dynamicProgrammingTable[currentHeight]);
  }

  console.log('%s', finalComputedAnswer);
  return finalComputedAnswer;
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function executeTestScenario(scenarioNumber) {
  const inputElementIdentifier = "input" + scenarioNumber;
  const inputSourceElement = document.getElementById(inputElementIdentifier);
  const scenarioInputContent = inputSourceElement.value;

  const calculatedResult = processData(scenarioInputContent);

  const outputElementIdentifier = "output" + scenarioNumber;
  const outputReferenceElement = document.getElementById(outputElementIdentifier);
  const expectedOutputString = outputReferenceElement.value.split("\n")[0];

  let testOutcomeStatus = "WA";
  if (calculatedResult.toString() === expectedOutputString) {
    testOutcomeStatus = "AC";
  }

  const resultDisplayIdentifier = "result" + scenarioNumber;
  const resultDisplayElement = document.getElementById(resultDisplayIdentifier);
  resultDisplayElement.innerHTML = testOutcomeStatus;
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
