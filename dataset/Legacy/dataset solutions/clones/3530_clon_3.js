const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const collectedLines = [];

inputReader.on('line', (currentLine) => {
  collectedLines.push(currentLine);
});

inputReader.on('close', () => {
  inputProcessor = initializeInputProcessor(collectedLines);
  logExecutionDetails();
});

function logExecutionDetails() {
  debugLog("-----start-----");
  const startTime = new Date();
  Main();
  const endTime = new Date();
  const durationMs = endTime - startTime;
  debugLog("----- end -----");
  debugLog("time : " + durationMs + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

function getNextInt() { return convertInput(getNextToken(), 1); }
function getNextStrArray() { return convertInput(getNextToken(), 2); }
function getNextIntArray() { return convertInput(getNextToken(), 4); }
function getNextCharArray() { return convertInput(getNextToken(), 6); }

function getNextToken() { return inputProcessor.getNext(); }
function hasMoreTokens() { return inputProcessor.hasMore(); }

function initializeInputProcessor(sourceData) {
  const processorInstance = {
    sourceData: sourceData,
    currentIdx: 0,
    maxIdx: sourceData.length,
    hasMore: function() { return (this.currentIdx < this.maxIdx); },
    getNext: function() {
      if (!this.hasMore()) {
        throw new Error("ArrayIndexOutOfBoundsException: No more input available.");
      } else {
        const currentInputLine = this.sourceData[this.currentIdx];
        this.currentIdx++;
        return currentInputLine;
      }
    }
  };
  return processorInstance;
}

function outputResult(message) { console.log(message); }
function debugLog(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (e) {
    return inputValue;
  }
}

function Main() {
  const sourceString = getNextToken();
  const targetString = getNextToken();

  const alphabetChars = "abcdefghijklmnopqrstuvwxyz";
  const charIndexMap = {};

  for (const char of alphabetChars) {
    charIndexMap[char] = new Set();
  }

  for (let idx = 0; idx < sourceString.length; idx++) {
    const charInSource = sourceString[idx];
    charIndexMap[charInSource].add(idx);
  }

  for (let currentStringIndex = 0; currentStringIndex < sourceString.length; currentStringIndex++) {
    for (let alphabetCharIndex = 0; alphabetCharIndex < alphabetChars.length; alphabetCharIndex++) {
      const currentAlphabetChar = alphabetChars[alphabetCharIndex];
      const targetCharForCurrentIndex = targetString[currentStringIndex];

      const isCharPresentAtCurrentIndex = charIndexMap[currentAlphabetChar].has(currentStringIndex);

      if (!isCharPresentAtCurrentIndex || currentAlphabetChar === targetCharForCurrentIndex) {
        continue;
      }

      const setForCurrentAlphabetChar = charIndexMap[currentAlphabetChar];
      const setForTargetChar = charIndexMap[targetCharForCurrentIndex];

      charIndexMap[currentAlphabetChar] = setForTargetChar;
      charIndexMap[targetCharForCurrentIndex] = setForCurrentAlphabetChar;
    }
  }

  const resultArray = new Array(sourceString.length);
  for (const charKey of alphabetChars) {
    const indicesForThisChar = Array.from(charIndexMap[charKey]);
    for (const indexToPlace of indicesForThisChar) {
      resultArray[indexToPlace] = charKey;
    }
  }

  const finalOutputString = convertInput(resultArray, 0);

  debugLog(targetString);
  debugLog(finalOutputString);

  if (finalOutputString === targetString) {
    outputResult("Yes");
  } else {
    outputResult("No");
  }
}
