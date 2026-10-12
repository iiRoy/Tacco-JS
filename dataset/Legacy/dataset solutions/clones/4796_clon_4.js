const standardInput = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let collectedLines = [];
let inputManagerInstance;

standardInput.on('line', function(currentLine){
  collectedLines.push(currentLine);
});

standardInput.on('close', function(){
  inputManagerInstance = new InputManager(collectedLines);
  console.error('\n↑Input ↓Output');
  executeCalculation();
});

function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputManager {
  constructor(lines) {
    this.dataStore = lines;
    this.currentPosition = 0;
    this.totalLines = lines.length;
  }

  hasMoreData() {
    return this.currentPosition < this.totalLines;
  }

  retrieveNextLine() {
    if (this.hasMoreData()) {
      return this.dataStore[this.currentPosition++];
    } else {
      throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
    }
  }
}

const conversionHandlers = {
  1: (val) => parseInt(val, 10),
  2: (val) => val.split(' '),
  4: (val) => val.split(' ').map(Number),
  6: (val) => val.split(''),
  7: (val) => val.split('').map(Number),
  8: (arr) => arr.join(' '),
  9: (arr) => arr.join('\n'),
  0: (arr) => arr.join(''),
  default: (val) => val
};

function applyConversion(inputValue, operationCode) {
  try {
    const handler = conversionHandlers[operationCode] || conversionHandlers.default;
    return handler(inputValue);
  } catch (e) {
    return inputValue;
  }
}

function fetchNextInput() {
  return inputManagerInstance.retrieveNextLine();
}

function checkInputAvailability() {
  return inputManagerInstance.hasMoreData();
}

function fetchNextInteger() {
  return applyConversion(fetchNextInput(), 1);
}

function fetchNextStringArray() {
  return applyConversion(fetchNextInput(), 2);
}

function fetchNextIntegerArray() {
  return applyConversion(fetchNextInput(), 4);
}

function fetchNextCharacterArray() {
  return applyConversion(fetchNextInput(), 6);
}

function displayResult(content) {
  console.log(content);
}

function logDiagnostic(message) {
  console.error('debug:' + require('util').inspect(message, false, null));
}

function calculateEvenFloor(value) {
  return value - (value % 2);
}

function executeCalculation() {
  const [aI, aO, aT, aJ, aL, aS, aZ] = fetchNextIntegerArray();

  const relevantValuesA = [aI, aJ, aL];
  const sumA = relevantValuesA.reduce((accumulator, currentVal) => accumulator + calculateEvenFloor(currentVal), 0);

  const relevantValuesB = [aI - 1, aJ - 1, aL - 1];
  const sumB = relevantValuesB.reduce((accumulator, currentVal) => accumulator + calculateEvenFloor(currentVal), 0) + 3;

  const finalOutcome = Math.max(sumA, sumB) + aO;

  displayResult(finalOutcome);
}
