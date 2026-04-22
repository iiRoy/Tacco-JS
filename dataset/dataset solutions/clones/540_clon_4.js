const systemIO = require('fs');
const inputBufferCapacity = 1024 * 1024;
let inputBuffer = Buffer.alloc(inputBufferCapacity);
let totalBytesGathered = 0;
const standardInputFileDescriptor = 0;

try {
    let bytesReadChunk;
    while ((bytesReadChunk = systemIO.readSync(standardInputFileDescriptor, inputBuffer, totalBytesGathered, inputBufferCapacity - totalBytesGathered)) > 0) {
        totalBytesGathered += bytesReadChunk;
        if (totalBytesGathered >= inputBufferCapacity) {
            inputBuffer = Buffer.concat([inputBuffer, Buffer.alloc(inputBufferCapacity)]);
        }
    }
} catch (error) {
    // Error handling for fs.readSync can be complex depending on environment.
    // For typical competitive programming scenarios, this block might be empty.
}

const rawInputText = inputBuffer.toString('utf8', 0, totalBytesGathered).trim();
const lineSegments = rawInputText.split("\n");

const totalElements = Number(lineSegments.shift());

const initialSequence = lineSegments.shift().split(" ").map(Number);

const orderedSequence = initialSequence.slice().sort((elementA, elementB) => elementA - elementB);

const swapCount = Number(lineSegments.shift());

const exchangeInstructions = lineSegments.map(segment => segment.split(" ").map(Number).map(val => val - 1));
exchangeInstructions.unshift([0, 0]);

const currentMismatchMap = new Map();
const goalMismatchMap = new Map();

for (let currentIdx = 0; currentIdx < initialSequence.length; ++currentIdx) {
    if (initialSequence[currentIdx] !== orderedSequence[currentIdx]) {
        currentMismatchMap.set(currentIdx, initialSequence[currentIdx]);
        goalMismatchMap.set(currentIdx, orderedSequence[currentIdx]);
    }
}

const goalSignature = [...goalMismatchMap.values()].join(",");

let matchFound = false;
let finalOperationIndex = -1;
let currentOperationStep = 0;

while (currentOperationStep <= swapCount) {
    const [indexOne, indexTwo] = exchangeInstructions[currentOperationStep];

    const valueAtIndexOne = currentMismatchMap.get(indexOne);
    const valueAtIndexTwo = currentMismatchMap.get(indexTwo);

    currentMismatchMap.set(indexOne, valueAtIndexTwo);
    currentMismatchMap.set(indexTwo, valueAtIndexOne);

    const currentSignature = [...currentMismatchMap.values()].join(",");

    if (currentSignature === goalSignature) {
        matchFound = true;
        finalOperationIndex = currentOperationStep;
        break;
    }

    currentOperationStep++;
}

if (matchFound) {
    console.log(finalOperationIndex);
} else {
    console.log(-1);
}