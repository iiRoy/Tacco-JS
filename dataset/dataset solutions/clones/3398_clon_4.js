class CounterState {
  constructor(initialDimension) {
    this.sequenceValues = Array(initialDimension).fill(1);
    this.incrementCounter = 1;
    this.operationMode = 0; // 0: uniform/normal, 1: non-uniform/carry, 2: extended
  }

  evaluateModeAfterExtension() {
    if (this.operationMode === 2) {
      let allElementsMatchFirst = true;
      if (this.sequenceValues.length > 0) {
        const firstElement = this.sequenceValues[0];
        for (let idx = 0; idx < this.sequenceValues.length; idx++) {
          if (this.sequenceValues[idx] !== firstElement) {
            allElementsMatchFirst = false;
            break;
          }
        }
      }
      this.operationMode = allElementsMatchFirst ? 0 : 1;
    }
  }

  reduceSequence(newLength) {
    this.sequenceValues = this.sequenceValues.slice(0, newLength);
  }

  extendSequence(newLength, oldLength) {
    const difference = newLength - oldLength;
    for (let idx = 0; idx < difference; idx++) {
      this.sequenceValues.push(1);
    }
    this.operationMode = 2;
  }

  processEqualDimension(currentLength) {
    this.sequenceValues = this.sequenceValues.slice(0, currentLength);

    if (this.operationMode === 0) {
      this.sequenceValues[currentLength - 1]++;
      if (this.sequenceValues.length !== 1) {
        this.operationMode = 1;
        this.incrementCounter++;
      }
    } else if (this.operationMode === 1) {
      let changeOccurred = false;
      for (let idx = currentLength - 1; idx >= 0; idx--) {
        if (this.sequenceValues[idx] === this.incrementCounter) {
          this.sequenceValues[idx] = 1;
        } else {
          this.sequenceValues[idx]++;
          this.operationMode = 2;
          changeOccurred = true;
          break;
        }
      }
    }
  }
}

function processInputData(inputString) {
  const dataLines = inputString.split("\n");
  const arrayLength = parseInt(dataLines[0]);
  const inputNumbers = dataLines[1].split(" ").map(Number);

  const stateManager = new CounterState(inputNumbers[0]);

  for (let k = 1; k < arrayLength; k++) {
    const currentNumber = inputNumbers[k];
    const previousNumber = inputNumbers[k - 1];

    if (currentNumber < previousNumber) {
      stateManager.reduceSequence(currentNumber);
    }

    stateManager.evaluateModeAfterExtension();

    if (currentNumber > previousNumber) {
      stateManager.extendSequence(currentNumber, previousNumber);
    } else if (currentNumber === previousNumber) {
      stateManager.processEqualDimension(currentNumber);
    }
  }

  console.log('%s', stateManager.incrementCounter);
}

function debugExecution() {
  var input = document.getElementById("input").value;
  processInputData(input);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
