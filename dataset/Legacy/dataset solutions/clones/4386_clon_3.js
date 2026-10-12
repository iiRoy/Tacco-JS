process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = '';
process.stdin.on('data', function(chunkData) {
    inputBuffer += chunkData;
});

process.stdin.on('end', function() {
    processInputData(inputBuffer.split(/\r?\n/));
});

function processInputData(linesOfInput) {
    const arraySize = parseInt(linesOfInput[0], 10);
    const stringValues = linesOfInput[1].split(' ');

    // Type III: Use map for parsing the array, more idiomatic JavaScript
    const permutationArray = stringValues.map(strVal => parseInt(strVal, 10));

    let totalSwaps = 0;

    for (let currentIndex = 0; currentIndex < arraySize; currentIndex++) {
        // Type III: Introduce a helper constant for the expected value at the current index
        const expectedPositionValue = currentIndex + 1;

        // Type III: Guard clause - if the element is not in its expected position, skip to the next iteration
        if (permutationArray[currentIndex] !== expectedPositionValue) {
            continue;
        }

        // If the element IS in its expected position, it needs to be swapped.
        // Type III: Refactor conditional logic to determine the swap target index once
        let targetSwapIndex;
        if (currentIndex === arraySize - 1) {
            // If it's the last element and it's in place, swap with the previous one
            targetSwapIndex = currentIndex - 1;
        } else {
            // Otherwise, swap with the next one
            targetSwapIndex = currentIndex + 1;
        }

        performSwap(permutationArray, currentIndex, targetSwapIndex);
        totalSwaps++;
    }

    console.log(totalSwaps);
}

function performSwap(targetArray, sourceIndex, destinationIndex) {
    const tempValue = targetArray[sourceIndex];
    targetArray[sourceIndex] = targetArray[destinationIndex];
    targetArray[destinationIndex] = tempValue;
}
