const readline = require('readline');
const util = require('util');

let inputLinesBuffer = [];
let inputReaderInstance;
let inputProcessor;

function createInputProcessor(lines) {
  return {
    lineData: lines,
    currentLineIndex: 0,
    totalLines: lines.length,
    hasMoreInput: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    getNextLine: function() {
      if (this.hasMoreInput()) {
        return this.lineData[this.currentLineIndex++];
      } else {
        throw new Error('ArrayIndexOutOfBoundsException: No more input available.');
      }
    }
  };
}

function parseInteger(value) { return parseInt(value, 10); }
function splitBySpace(value) { return value.split(' '); }
function splitAndParseIntegers(value) { return value.split(' ').map(Number); }
function splitByCharacter(value) { return value.split(''); }
function splitAndParseCharactersAsIntegers(value) { return value.split('').map(Number); }
function joinWithSpace(arr) { return arr.join(' '); }
function joinWithNewline(arr) { return arr.join('\n'); }
function joinWithoutSeparator(arr) { return arr.join(''); }

function readInteger() { return parseInteger(inputProcessor.getNextLine()); }
function readStringArray() { return splitBySpace(inputProcessor.getNextLine()); }
function readIntegerArray() { return splitAndParseIntegers(inputProcessor.getNextLine()); }
function readCharacterArray() { return splitByCharacter(inputProcessor.getNextLine()); }

function printResult(data) { console.log(data); }
function logDebugInfo(message) { console.error('debug:' + util.inspect(message, false, null)); }

function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

inputReaderInstance = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReaderInstance.on('line', function(line) {
  inputLinesBuffer.push(line);
});

inputReaderInstance.on('close', function() {
  inputProcessor = createInputProcessor(inputLinesBuffer);
  console.error('\n');
  const startTime = Date.now();
  executeSolution();
  const elapsedTime = Date.now() - startTime;
  logDebugInfo('time : ' + elapsedTime + 'ms');
  logDebugInfo('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function executeSolution() {
  const totalElements = readInteger();
  const sequenceCounts = Array.from({ length: totalElements + 1 }, () => 0);
  let longestSequenceLength = 0;

  for (let i = 0; i < totalElements; i++) {
    const currentElement = readInteger();
    const currentSequenceLength = sequenceCounts[currentElement - 1] + 1;
    
    sequenceCounts[currentElement] = currentSequenceLength;
    
    longestSequenceLength = Math.max(longestSequenceLength, currentSequenceLength);
  }
  
  const elementsToRemove = totalElements - longestSequenceLength;
  printResult(elementsToRemove);
}
