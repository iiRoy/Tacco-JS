function processInputData(rawData) {
  const firstLineSegments = rawData[0];
  const modulusVal = Number(firstLineSegments[1]);

  const sourceNumericStrings = rawData[1];
  const transformedNumbers = sourceNumericStrings.map(elementString => {
    const parsedNumericValue = Number(elementString);
    return parsedNumericValue % modulusVal;
  });

  const calculateSubarrayMatches = (numbersArray, startingIndex, currentModulus) => {
    let currentSubarrayMatches = 0;
    let runningModSum = 0;

    const arrayLength = numbersArray.length;
    for (let iterationIndex = startingIndex, segmentLength = 1; iterationIndex < arrayLength; iterationIndex++, segmentLength++) {
      const nextArrayElement = numbersArray[iterationIndex];
      const sumBeforeModulo = runningModSum + nextArrayElement;
      runningModSum = sumBeforeModulo % currentModulus;

      if (runningModSum === segmentLength) {
        currentSubarrayMatches++;
      }
    }
    return currentSubarrayMatches;
  };

  const initialAccumulatorValue = 0;
  const finalResult = transformedNumbers.reduce((overallMatchSum, _ignoredValue, startingIndex) => {
    const matchesForThisStartingPoint = calculateSubarrayMatches(transformedNumbers, startingIndex, modulusVal);
    return overallMatchSum + matchesForThisStartingPoint;
  }, initialAccumulatorValue);

  console.log(finalResult);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
const cleanedContent = rawFileContent.trim();
const contentLines = cleanedContent.split("\n");

const parsedInputData = contentLines.map(lineContent => lineContent.split(' '));

processInputData(parsedInputData);
