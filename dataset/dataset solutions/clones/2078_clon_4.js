const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

const inputLineBuffer = [];
let inputSource;

inputReader.on('line', (currentLine) => { inputLineBuffer.push(currentLine); });

inputReader.on('close', () => {
  inputSource = initializeInputProcessor(inputLineBuffer);
  process.stderr.write("\n");
  const startTime = Date.now();
  executePrimaryLogic();
  const duration = Date.now() - startTime;
  debugLog("time : " + (duration) + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopy(originalObject) { return JSON.parse(JSON.stringify(originalObject)); }

function parseInteger() { return convertInput(retrieveNext(), 1); }
function splitStringArray() { return convertInput(retrieveNext(), 2); }
function splitIntegerArray() { return convertInput(retrieveNext(), 4); }
function splitCharacterArray() { return convertInput(retrieveNext(), 6); }
function retrieveNext() { return inputSource.retrieveNext(); }
function hasMoreInput() { return inputSource.hasMoreInput(); }

function initializeInputProcessor(inputData) {
  let currentPosition = 0;
  const dataLength = inputData.length;

  function* lineIterator() {
    while (currentPosition < dataLength) {
      yield inputData[currentPosition++];
    }
  }

  const iterator = lineIterator();

  return {
    inputLines: inputData,
    currentLineIndex: currentPosition,
    totalLines: dataLength,
    hasMoreInput: () => currentPosition < dataLength,
    retrieveNext: () => {
      const result = iterator.next();
      if (!result.done) {
        return result.value;
      } else {
        throw new Error("InputExhaustedException: No more input available.");
      }
    }
  };
}

function outputLine(content) { process.stdout.write(content + '\n'); }

function debugLog(message) {
  process.stderr.write("debug:" + require("util").inspect(message, { colors: false, depth: null }) + '\n');
}

function convertInput(inputValue, conversionType) {
  const conversionMap = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")]
  ]);

  try {
    const converter = conversionMap.get(conversionType);
    return converter ? converter(inputValue) : inputValue;
  } catch (e) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  const outputSequence = ["aaa", "aab", "abb", "abc"];

  outputSequence.reduce((accumulator, currentString) => {
    outputLine(currentString);
    return accumulator;
  }, null);
}
