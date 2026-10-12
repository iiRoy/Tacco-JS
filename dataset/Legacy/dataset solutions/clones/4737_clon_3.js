var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

function createDataIterator(lines) {
  return {
    sourceLines: lines,
    currentIdx: 0,
    totalLines: lines.length,
    getNextLine: function() {
      const ensureAvailability = () => {
        if (!this.hasMoreLines()) {
          throw "NoSuchElementException:次に要素は無いよ";
        }
      };
      ensureAvailability();
      const currentLineContent = this.sourceLines[this.currentIdx];
      this.currentIdx++;
      return currentLineContent;
    },
    hasMoreLines: function() {
      return (this.currentIdx < this.totalLines);
    }
  };
}

var dataIterator = createDataIterator(rawData);

function fetchNextLine() { return dataIterator.getNextLine(); }
function hasMoreLines() { return dataIterator.hasMoreLines(); }
function printOutput(content) { console.log(content); }
function printError(content) { console.error(content); }

const parseInteger = (str) => parseInt(str);
const splitBySpace = (str) => str.split(" ");
const splitByChar = (str) => str.split("");
const convertStringsToNumbers = (arr) => arr.map((item) => Number(item));
const joinWithSpace = (arr) => arr.join(" ");
const joinWithNewline = (arr) => arr.join("\n");
const joinConcatenated = (arr) => arr.join("");

//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInteger(inputValue);
      case 2: return splitBySpace(inputValue);
      case 4: return convertStringsToNumbers(splitBySpace(inputValue));
      case 6: return splitByChar(inputValue);
      case 7: return convertStringsToNumbers(splitByChar(inputValue));
      case 8: return joinWithSpace(inputValue);
      case 9: return joinWithNewline(inputValue);
      case 0: return joinConcatenated(inputValue);
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function fetchNextInteger() { return transformInput(fetchNextLine(), 1); }
function fetchNextStringArray() { return transformInput(fetchNextLine(), 2); }
function fetchNextIntegerArray() { return transformInput(fetchNextLine(), 4); }
function fetchNextCharacterArray() { return transformInput(fetchNextLine(), 6); }

function calculateRemainderIncrement(remainderValue) {
  let incrementAmount = 0;
  if (remainderValue >= 6) {
    incrementAmount = 2;
  } else if (remainderValue > 0) {
    incrementAmount = 1;
  }
  return incrementAmount;
}

function executeMainLogic() {
  const inputNumber = fetchNextInteger();

  const divisionResult = inputNumber / 11;
  const baseQuotient = Math.floor(divisionResult);
  let resultValue = baseQuotient * 2;

  const remainder = inputNumber % 11;
  const additionalIncrement = calculateRemainderIncrement(remainder);

  resultValue += additionalIncrement;

  printOutput(resultValue);
}

executeMainLogic();
