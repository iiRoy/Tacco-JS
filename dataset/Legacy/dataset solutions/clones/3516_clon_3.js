function getInput(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function printOutput(message){console.log(message);}
function printError(message){console.error(message);}

const mapToNumberArray = (arr) => arr.map(Number);

const conversionStrategies = {
  0: (data) => data,
  1: (data) => parseInt(data, 10),
  2: (data) => data.split(" "),
  3: (data) => data.split("\n"),
  4: (data) => mapToNumberArray(data.split(" ")),
  5: (data) => mapToNumberArray(data.split("\n")),
  6: (data) => data.split(""),
  7: (data) => mapToNumberArray(data.split("")),
};

function convertInput(dataString, conversionType) {
  const strategyExecutor = conversionStrategies[conversionType];
  if (strategyExecutor) {
    return strategyExecutor(dataString);
  }
  return dataString;
}

function updateFrequencyMap(targetMap, keyToUpdate) {
  targetMap[keyToUpdate] = (targetMap[keyToUpdate] || 0) + 1;
}

function findMostFrequentElement(countsMap) {
  let highestCount = 0;
  let mostFrequentKey = "";
  for (const elementKey in countsMap) {
    if (Object.prototype.hasOwnProperty.call(countsMap, elementKey)) {
      const currentElementCount = countsMap[elementKey];
      if (currentElementCount > highestCount) {
        highestCount = currentElementCount;
        mostFrequentKey = elementKey;
      }
    }
  }
  return { element: mostFrequentKey, count: highestCount };
}

function checkSingleConflictingCase(oddKeysArray, evenKeysArray) {
  return oddKeysArray.length === 1 && evenKeysArray.length === 1 && evenKeysArray[0] === oddKeysArray[0];
}

function processData(rawInputData) {
  const linesOfInput = convertInput(rawInputData, 3);
  const totalCount = convertInput(linesOfInput[0], 1);
  const dataElements = convertInput(linesOfInput[1], 2);

  const oddPositionValueCounts = {};
  const evenPositionValueCounts = {};

  for (let elementIdx = 0; elementIdx < totalCount; elementIdx++) {
    const currentElementValue = dataElements[elementIdx];
    if (elementIdx % 2 === 0) {
      updateFrequencyMap(oddPositionValueCounts, currentElementValue);
    } else {
      updateFrequencyMap(evenPositionValueCounts, currentElementValue);
    }
  }

  let requiredChanges = 0;
  const uniqueOddValues = Object.keys(oddPositionValueCounts);
  const uniqueEvenValues = Object.keys(evenPositionValueCounts);

  if (checkSingleConflictingCase(uniqueOddValues, uniqueEvenValues)) {
    printOutput(totalCount / 2);
    return;
  }

  const { element: primaryOddElement, count: primaryOddElementCount } = findMostFrequentElement(oddPositionValueCounts);

  const halfTotalCount = totalCount / 2;
  requiredChanges += halfTotalCount - primaryOddElementCount;

  let candidateEvenValues = uniqueEvenValues;
  if (candidateEvenValues.includes(primaryOddElement)) {
    candidateEvenValues = candidateEvenValues.filter(key => key !== primaryOddElement);
  }

  let maxEvenCandidateCount = 0;
  if (candidateEvenValues.length > 0) {
    const filteredEvenCountsMap = {};
    for (const key of candidateEvenValues) {
        filteredEvenCountsMap[key] = evenPositionValueCounts[key];
    }
    maxEvenCandidateCount = findMostFrequentElement(filteredEvenCountsMap).count;
  }

  requiredChanges += halfTotalCount - maxEvenCandidateCount;

  printError(uniqueOddValues);
  printError(uniqueEvenValues);
  printOutput(requiredChanges);
}

processData(getInput());
