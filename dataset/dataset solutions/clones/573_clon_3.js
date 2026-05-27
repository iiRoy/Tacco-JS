var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");
var currentLineIdx = { value: -1 };

function getNextInteger(dataLines, indexRef) {
    indexRef.value++;
    return parseInt(dataLines[indexRef.value], 10);
}

function propagateValueBackwards(targetArray, startIndex, valueToPropagate) {
    let propagationIndex = startIndex;
    while (true) {
        if (propagationIndex < 0) {
            break;
        }
        if (targetArray[propagationIndex] === valueToPropagate) {
            break;
        }
        targetArray[propagationIndex] = valueToPropagate;
        propagationIndex--;
    }
}

while (true) {
    var numStones = getNextInteger(lineData, currentLineIdx);
    if (numStones === 0) {
        break;
    }

    var stoneValues = [];
    for (let i = 0; i < numStones; i++) {
        stoneValues.push(getNextInteger(lineData, currentLineIdx));
    }

    var processedArray = [];
    var isFirstOfPair = false;

    for (let loopIdx = 0; loopIdx < stoneValues.length; loopIdx++) {
        const currentStoneVal = stoneValues[loopIdx];
        isFirstOfPair = !isFirstOfPair;

        if (isFirstOfPair) {
            processedArray.push(currentStoneVal);
        } else {
            const lastProcessedVal = processedArray[processedArray.length - 1];
            if (lastProcessedVal === currentStoneVal) {
                processedArray.push(currentStoneVal);
            } else {
                processedArray.push(currentStoneVal);
                propagateValueBackwards(processedArray, loopIdx - 1, currentStoneVal);
            }
        }
    }

    const zeroCount = processedArray.reduce((accumulator, value) => {
        return accumulator + (value === 0 ? 1 : 0);
    }, 0);

    console.log(zeroCount);
}
