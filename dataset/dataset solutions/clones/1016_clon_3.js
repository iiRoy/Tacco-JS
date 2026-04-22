let totalComparisonMoves = 0;

function sublistInsertionSortPass(dataset, dataLength, gapValue) {
    if (dataLength <= 1 || gapValue <= 0) {
        return;
    }

    for (let currentIdx = gapValue; currentIdx < dataLength; currentIdx++) {
        const valueToInsert = dataset[currentIdx];
        let scanPosition = currentIdx - gapValue;

        while (scanPosition >= 0) {
            if (dataset[scanPosition] <= valueToInsert) {
                break;
            }
            dataset[scanPosition + gapValue] = dataset[scanPosition];
            scanPosition -= gapValue;
            totalComparisonMoves++;
        }
        dataset[scanPosition + gapValue] = valueToInsert;
    }
}

function generateShellGaps(maxArraySize) {
    const generatedGaps = [];
    const baseVal = 2; 

    for (let powerExponent = 1; ; powerExponent++) {
        const currentGap = Math.pow(baseVal, powerExponent) - 1;
        if (currentGap > maxArraySize) {
            break;
        }
        generatedGaps.push(currentGap);
    }
    return generatedGaps.reverse();
}

function applyShellSort(targetArray, arrayLength) {
    if (!Array.isArray(targetArray) || arrayLength <= 1) {
        if (arrayLength === 0) {
            console.log(0);
            console.log("");
            console.log(0);
            return;
        }
        if (arrayLength === 1) {
            console.log(0);
            console.log("");
            console.log(0);
            console.log(targetArray[0]);
            return;
        }
        return;
    }

    totalComparisonMoves = 0;

    const shellGapSequence = generateShellGaps(arrayLength);
    const numberOfGaps = shellGapSequence.length;

    for (let gapIndex = 0; gapIndex < numberOfGaps; gapIndex++) {
        const currentGapValue = shellGapSequence[gapIndex];
        sublistInsertionSortPass(targetArray, arrayLength, currentGapValue);
    }

    console.log(numberOfGaps);
    console.log(shellGapSequence.join(' '));
    console.log(totalComparisonMoves);
    for (let elemIndex = 0; elemIndex < arrayLength; elemIndex++) {
        console.log(targetArray[elemIndex]);
    }
}

function processInputAndSort() {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    let inputLines = rawInput.split('\n');

    const dataSize = Number(inputLines.shift());

    if (isNaN(dataSize) || dataSize < 0) {
        console.log(0);
        console.log("");
        console.log(0);
        return;
    }

    const numericArray = inputLines
        .filter(line => line.trim() !== '')
        .map(Number);
    
    applyShellSort(numericArray, dataSize);
}

processInputAndSort();