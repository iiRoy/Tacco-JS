var fileSystemModule = require('fs');

function readAllStdinContent() {
    var fileDescriptor = process.stdin.fd;
    var fileStats = fileSystemModule.fstatSync(fileDescriptor);
    var totalBytesToRead = fileStats.size;
    var dataBuffer = Buffer.alloc(totalBytesToRead);
    var actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, totalBytesToRead, 0);
    return dataBuffer.toString('utf8', 0, actualBytesRead);
}

function parseBase10Integer(stringValue) {
    return parseInt(stringValue, 10);
}

function executePermutationSimulation() {
    var rawInputString = readAllStdinContent();
    var inputLinesArray = rawInputString.split('\n');

    var gridDimension = parseBase10Integer(inputLinesArray[0]);
    var numberOfSwaps = parseBase10Integer(inputLinesArray[1]);

    var permutationMap = new Int8Array(gridDimension);
    var mapLength = permutationMap.length;

    // Initialize the permutation map with identity mapping
    for (var currentIdx = 0; currentIdx < mapLength; currentIdx++) {
        permutationMap[currentIdx] = currentIdx;
    }

    // Process swap instructions
    var firstSwapLineIndex = 2;
    var lastSwapLineIndex = numberOfSwaps + firstSwapLineIndex;

    for (var lineIterator = firstSwapLineIndex; lineIterator < lastSwapLineIndex; lineIterator++) {
        var swapCoordinatesStr = inputLinesArray[lineIterator].split(",");
        var firstElementIndex = parseBase10Integer(swapCoordinatesStr[0]) - 1;
        var secondElementIndex = parseBase10Integer(swapCoordinatesStr[1]) - 1;

        // Perform an XOR swap on the values at the specified indices
        var valueAtFirst = permutationMap[firstElementIndex];
        var valueAtSecond = permutationMap[secondElementIndex];

        valueAtFirst = valueAtFirst ^ valueAtSecond;
        valueAtSecond = valueAtFirst ^ valueAtSecond;
        valueAtFirst = valueAtFirst ^ valueAtSecond;

        permutationMap[firstElementIndex] = valueAtFirst;
        permutationMap[secondElementIndex] = valueAtSecond;
    }

    // Output the final permutation, adjusted to 1-based indexing
    for (var outputIterator = 0; outputIterator < mapLength; outputIterator++) {
        console.log(permutationMap[outputIterator] + 1);
    }
}

executePermutationSimulation();
