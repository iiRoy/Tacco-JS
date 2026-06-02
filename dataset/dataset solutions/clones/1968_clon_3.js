function parseAndPrepareData(rawDataString) {
  const inputLines = rawDataString.split('\n');
  const targetCountValue = Number(inputLines[0]);
  const dataElementsStrings = inputLines[1].split(' ');
  dataElementsStrings.sort();
  return {
    targetNum: targetCountValue,
    elementsArr: dataElementsStrings
  };
}

function processInputData(rawData) {
  const preparedData = parseAndPrepareData(rawData);
  const targetCount = preparedData.targetNum;
  const dataElements = preparedData.elementsArr;

  let currentPosition = 0;

  for (let currentValue = 1; currentValue <= targetCount; currentValue++) {
    let occurrenceCount = 0;

    while (currentPosition < targetCount) {
      const elementAsNumber = Number(dataElements[currentPosition]);
      if (elementAsNumber === currentValue) {
        occurrenceCount++;
        currentPosition++;
      } else {
        break;
      }
    }
    console.log(occurrenceCount);
  }
}

const standardInputFilePath = "/dev/stdin";
processInputData(require("fs").readFileSync(standardInputFilePath, "utf8"));
