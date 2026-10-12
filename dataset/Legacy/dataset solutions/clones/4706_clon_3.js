const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const inputLines = [];

inputReader.on('line', function(lineContent) {
  inputLines.push(lineContent);
});

inputReader.on('close', function() {
  inputHandler = createInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  processSimulation();
});

function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function parseInteger(data) { return parseInt(data, 10); }
function splitBySpace(data) { return data.split(' '); }
function splitAndParseInt(data) { return data.split(' ').map(Number); }
function splitByChar(data) { return data.split(''); }
function splitByCharAndParseInt(data) { return data.split('').map(Number); }
function joinBySpace(arr) { return arr.join(' '); }
function joinByNewline(arr) { return arr.join('\n'); }
function joinNoChar(arr) { return arr.join(''); }

function convertInput(data, typeCode) {
  try {
    switch (typeCode) {
      case 1: return parseInteger(data);
      case 2: return splitBySpace(data);
      case 4: return splitAndParseInt(data);
      case 6: return splitByChar(data);
      case 7: return splitByCharAndParseInt(data);
      case 8: return joinBySpace(data);
      case 9: return joinByNewline(data);
      case 0: return joinNoChar(data);
      default: return data;
    }
  } catch (error) {
    return data;
  }
}

function readInt() { return convertInput(getNextToken(), 1); }
function readStrArray() { return convertInput(getNextToken(), 2); }
function readIntArray() { return convertInput(getNextToken(), 4); }
function readCharArray() { return convertInput(getNextToken(), 6); }
function getNextToken() { return inputHandler.next(); }
function hasMoreTokens() { return inputHandler.hasMoreTokens(); }

function createInputHandler(inputData) {
  return {
    dataList: inputData,
    currentIndex: 0,
    maxIndex: inputData.length,
    hasMoreTokens: function() { return (this.currentIndex < this.maxIndex); },
    next: function() {
      if (this.hasMoreTokens()) {
        return this.dataList[this.currentIndex++];
      } else {
        throw new Error('ArrayIndexOutOfBoundsException ‚There is no more input');
      }
    }
  };
}

function printOutput(message) { console.log(message); }
function printDebug(message) { console.error('debug:' + require('util').inspect(message, false, null)); }

function toggleState(state) {
  return state === "S" ? "W" : "S";
}

function determineNextSheepState(observerAction, currentSheepDerivedState, previousSheepDerivedState) {
  let nextState;
  if (observerAction === "o") {
    if (currentSheepDerivedState === "S") {
      nextState = previousSheepDerivedState;
    } else {
      nextState = toggleState(previousSheepDerivedState);
    }
  } else {
    if (currentSheepDerivedState === "S") {
      nextState = toggleState(previousSheepDerivedState);
    } else {
      nextState = previousSheepDerivedState;
    }
  }
  return nextState;
}

function processSimulation() {
  const sheepCount = readInt();
  const EXPECTED_FINAL_STATE = "S";
  const animalObservations = readCharArray();

  const sheepStates = ["S", "S"];

  for (let idx = 1; idx < sheepCount; idx++) {
    const currentSheepDerivedState = sheepStates[idx];
    const previousSheepDerivedState = sheepStates[idx - 1];
    const currentAnimalObservation = animalObservations[idx];

    const nextDerivedState = determineNextSheepState(
      currentAnimalObservation,
      currentSheepDerivedState,
      previousSheepDerivedState
    );
    sheepStates.push(nextDerivedState);
  }

  printDebug(sheepStates.join(""));

  if (sheepStates[sheepCount] === EXPECTED_FINAL_STATE) {
    sheepStates.pop();
    printOutput(sheepStates.join(""));
  } else {
    printOutput(-1);
  }
}
