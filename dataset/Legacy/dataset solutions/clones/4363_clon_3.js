function processInputData(rawDataString) {
  const trimmedData = rawDataString.trim();
  const stringParts = trimmedData.split(" ");

  const parsedNumbers = [];
  let partIndex = 0;
  while (partIndex < stringParts.length) {
    parsedNumbers.push(Number(stringParts[partIndex]));
    partIndex++;
  }

  const targetValue = 9;
  const positiveOutcomeMessage = 'Yes';
  const negativeOutcomeMessage = 'No';

  const evaluateCondition = (numberArray, comparisonValue) => {
    const firstElement = numberArray[0];
    const secondElement = numberArray[1];
    return firstElement === comparisonValue || secondElement === comparisonValue;
  };

  const isMatchFound = evaluateCondition(parsedNumbers, targetValue);

  if (isMatchFound) {
    console.log(positiveOutcomeMessage);
  } else {
    console.log(negativeOutcomeMessage);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
