function parseIntegerFromString(textValue) {
  return parseInt(textValue, 10);
}

function calculateSequenceMetric(sequenceElements) {
  return sequenceElements.slice(1).reduce((accumulator, currentElement, currentIndex) => {
    const previousElement = sequenceElements[currentIndex];
    return accumulator + Math.abs(currentElement - previousElement);
  }, 0);
}

function performRandomPermutation(originalArray) {
  const workingArray = [...originalArray];
  const arrayLength = workingArray.length;
  for (let k = 0; k < arrayLength - 1; k++) {
    const swapIndex = k + Math.floor(Math.random() * (arrayLength - k));
    const tempValue = workingArray[k];
    workingArray[k] = workingArray[swapIndex];
    workingArray[swapIndex] = tempValue;
  }
  return workingArray;
}

function processInputAndFindMax(rawInputString) {
  const parsedLines = rawInputString.split("\n");
  const sequenceLength = parseIntegerFromString(parsedLines[0]);
  const initialSequence = [];
  for (let idx = 1; idx <= sequenceLength; idx++) {
    initialSequence.push(parseIntegerFromString(parsedLines[idx]));
  }

  let highestMetricValue = 0;
  const numberOfTrials = 10000;

  for (let trialCount = 0; trialCount < numberOfTrials; trialCount++) {
    const currentPermutation = performRandomPermutation(initialSequence);
    const currentMetric = calculateSequenceMetric(currentPermutation);
    highestMetricValue = Math.max(highestMetricValue, currentMetric);
  }

  console.log(highestMetricValue);
}

processInputAndFindMax(require("fs").readFileSync("/dev/stdin", "utf8"));
