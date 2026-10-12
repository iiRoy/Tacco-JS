let inputHandler = initializeInputProcessor();
executeMainLogic();

function readInteger() { return convertInput(getNextLine(), 1); }
function readStringArray() { return convertInput(getNextLine(), 2); }
function readIntegerArray() { return convertInput(getNextLine(), 4); }
function readCharacterArray() { return convertInput(getNextLine(), 6); }
function getNextLine() { return inputHandler.next(); }
function hasMoreLines() { return inputHandler.hasNext(); }

function readInputFile() { return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); }

function createInputProcessor(linesArray) {
  let currentIdx = 0;
  const totalLinesCount = linesArray.length;

  const checkHasMore = () => currentIdx < totalLinesCount;

  const retrieveNextLine = () => {
    if (!checkHasMore()) {
      return "";
    }
    const lineToReturn = linesArray[currentIdx];
    currentIdx++;
    return lineToReturn;
  };

  return {
    lines: linesArray,
    currentIndex: currentIdx,
    totalLines: totalLinesCount,
    hasNext: checkHasMore,
    next: retrieveNextLine
  };
}

function initializeInputProcessor() {
  const rawInputLines = readInputFile();
  return createInputProcessor(rawInputLines);
}

function printOutput(data) { console.log(data); }
function printError(data) { console.error(data); }

function convertInput(inputValue, conversionType) {
  try {
    switch(conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((element) => Number(element));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((element) => Number(element));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(e) {
    return inputValue;
  }
}

const sortArrayDescending = (arr) => arr.sort((val1, val2) => val2 - val1);

const getTopNElements = (sourceArray, count) => {
  if (count <= 0) {
    return [];
  }
  const actualCount = Math.min(count, sourceArray.length);
  const selectedElements = [];
  for (let i = 0; i < actualCount; i++) {
    selectedElements.push(sourceArray[i]);
  }
  return selectedElements;
};

const calculateSumOfTopN = (dataArray, count) => {
  let currentSum = 0;
  const limit = Math.min(count, dataArray.length);
  for (let i = 0; i < limit; i++) {
    currentSum += dataArray[i];
  }
  return currentSum;
};

function executeMainLogic() {
  const firstLineData = readIntegerArray();
  const requiredX = firstLineData[0];
  const requiredY = firstLineData[1];
  const unusedA = firstLineData[2];
  const unusedB = firstLineData[3];
  const unusedC = firstLineData[4];

  let listA_raw = readIntegerArray();
  let listB_raw = readIntegerArray();
  const listC_raw = readIntegerArray();

  const sortedListA = sortArrayDescending([...listA_raw]);
  const sortedListB = sortArrayDescending([...listB_raw]);

  const selectedFromA = getTopNElements(sortedListA, requiredX);
  const selectedFromB = getTopNElements(sortedListB, requiredY);

  let allCandidateElements = [...selectedFromA, ...selectedFromB, ...listC_raw];

  const finalSortedCandidates = sortArrayDescending(allCandidateElements);

  const totalElementsToConsider = requiredX + requiredY;
  const finalResultSum = calculateSumOfTopN(finalSortedCandidates, totalElementsToConsider);

  printOutput(finalResultSum);
}
