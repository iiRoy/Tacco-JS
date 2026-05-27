var fileSystem = require('fs');
var rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInput.trim().split("\n");

var arrayLength = parseInt(inputLines.shift(), 10);
var initialArray = inputLines.shift().split(" ").map(Number);
var sortedInitialArray = initialArray.slice().sort((valA, valB) => valA - valB);

var swapCount = parseInt(inputLines.shift(), 10);
var swapOperations = inputLines.map(line => line.split(" ").map(Number).map(val => val - 1));
swapOperations.unshift([0, 0]);

var currentMismatchState = new Map();
var targetMismatchState = new Map();

for (let k = 0; k < initialArray.length; k++) {
    if (initialArray[k] !== sortedInitialArray[k]) {
        currentMismatchState.set(k, initialArray[k]);
        targetMismatchState.set(k, sortedInitialArray[k]);
    }
}

var desiredStateString = Array.from(targetMismatchState.values()).join(",");

var resultIndex = -1;

for (let opIdx = 0; opIdx <= swapCount; opIdx++) {
    let [firstIdx, secondIdx] = swapOperations[opIdx];

    let valueAtFirst = currentMismatchState.get(firstIdx);
    let valueAtSecond = currentMismatchState.get(secondIdx);

    if (valueAtSecond !== undefined) {
        currentMismatchState.set(firstIdx, valueAtSecond);
    } else {
        currentMismatchState.delete(firstIdx);
    }

    if (valueAtFirst !== undefined) {
        currentMismatchState.set(secondIdx, valueAtFirst);
    } else {
        currentMismatchState.delete(secondIdx);
    }

    var currentStateString = Array.from(currentMismatchState.values()).join(",");
    if (currentStateString === desiredStateString) {
        resultIndex = opIdx;
        break;
    }
}

console.log(resultIndex);
