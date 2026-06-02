var inputHandler = initializeInputProcessor();
executeMainLogic();

function readInteger() { return convertInput(getNextLine(), 1); }
function readStringArray() { return convertInput(getNextLine(), 2); } // 半角スペース分割
function readIntegerArray() { return convertInput(getNextLine(), 4); } // 半角スペース + 数値化
function readCharacterArray() { return convertInput(getNextLine(), 6); } // 1文字分割
function getNextLine() { return inputHandler.next(); }
function hasMoreLines() { return inputHandler.hasNext(); }

const STDIN_FILE_PATH = "/dev/stdin";
function readInputFile() { return require("fs").readFileSync(STDIN_FILE_PATH, "utf8").trim().split("\n"); }

const INPUT_LIST_KEY = "lineList";
const CURRENT_INDEX_KEY = "currentIndex";
const MAX_LINES_KEY = "maxLines";

function initializeInputProcessor() {
  const fileContentLines = readInputFile();
  const processorObject = {};

  processorObject[INPUT_LIST_KEY] = fileContentLines;
  processorObject[CURRENT_INDEX_KEY] = 0;
  processorObject[MAX_LINES_KEY] = fileContentLines.length;

  processorObject.hasNext = function () {
    return (this[CURRENT_INDEX_KEY] < this[MAX_LINES_KEY]);
  };

  processorObject.next = function () {
    if (!this.hasNext()) {
      return "";
    } else {
      const currentLine = this[INPUT_LIST_KEY][this[CURRENT_INDEX_KEY]];
      this[CURRENT_INDEX_KEY]++;
      return currentLine;
    }
  };
  return processorObject;
}

function printOutput(data) { console.log(data); } // 標準出力
function printError(data) { console.error(data); } // 標準エラー出力

// [no]要素の扱い。数値型
// 不明値、異常時:引数そのまま返す 1:数値へ変換
// 2:半角SPで分割 4:半角SPで分割し、数値配列へ
// 6:1文字で分割 7:1文字で分割し、数値配列へ
// 8:半角SPで結合 9:改行で結合 0:文字なしで結合
const parseToNumber = (str) => Number(str); // Small helper function for mapping

function convertInput(inputValue, conversionType) {
  try {
    let splitResult; // Temporary variable for split operations
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4:
        splitResult = inputValue.split(" ");
        return splitResult.map(parseToNumber);
      case 6: return inputValue.split("");
      case 7:
        splitResult = inputValue.split("");
        return splitResult.map(parseToNumber);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executeMainLogic() {
  const countN = readInteger();
  const listA = readIntegerArray();
  const listB = readIntegerArray();

  const positiveDifferences = [];
  let totalNegativeSum = 0;
  let totalDifferenceSum = 0;
  let resultOutput = 0;

  // First pass: Calculate differences and categorize
  for (let idx = 0; idx < countN; idx++) {
    const currentAValue = listA[idx];
    const currentBValue = listB[idx];
    const currentDifference = currentAValue - currentBValue; // Intermediate computation step

    totalDifferenceSum += currentDifference;

    if (currentDifference >= 0) {
      positiveDifferences.push(currentDifference);
    } else {
      const absoluteNegativeDiff = Math.abs(currentDifference); // Helper variable for clarity
      totalNegativeSum += absoluteNegativeDiff;
      resultOutput++;
    }
  }

  // Handle cases where total difference is negative
  if (totalDifferenceSum < 0) {
    printOutput(-1);
    return; // Early exit using a guard clause
  }

  // Sort positive differences in descending order
  positiveDifferences.sort((valA, valB) => valB - valA); // Using arrow function for sort comparator

  // Second pass: Reduce negative sum using positive differences
  let currentPositiveIndex = 0;
  const numPositiveDifferences = positiveDifferences.length; // Helper variable for loop bound

  // Structural change: using a while loop instead of a for loop
  while (currentPositiveIndex < numPositiveDifferences && totalNegativeSum > 0) {
    const currentPositiveDiff = positiveDifferences[currentPositiveIndex];
    totalNegativeSum -= currentPositiveDiff;
    resultOutput++;
    currentPositiveIndex++;
  }

  printOutput(resultOutput);
}
