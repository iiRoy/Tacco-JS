var inputData = [];
var readline = require('readline');

var ioHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

ioHandler.on('close', function () {
    var dataSize = Number(inputData[0]);
    var firstArr = inputData[1].split(" ").map(itemVal => Number(itemVal));
    var secondArr = inputData[2].split(" ").map(itemVal => Number(itemVal));
    var thirdArr = inputData[3].split(" ").map(itemVal => Number(itemVal));

    firstArr.sort((val1, val2) => val1 - val2);
    secondArr.sort((val1, val2) => val1 - val2);
    thirdArr.sort((val1, val2) => val1 - val2);

    var finalResult = 0;

    for (var idxB = 0; idxB < dataSize; idxB++) {
        var countA = findLowerBound(secondArr[idxB], firstArr, -1, dataSize) + 1;
        var countC = dataSize - findUpperBound(secondArr[idxB], thirdArr, -1, dataSize);
        
        finalResult += countA * countC;
    }
    console.log(finalResult);
});

function findLowerBound(valToFind, searchSpace, leftIdx, rightIdx, extraParam) {
    var midPoint = Math.floor((leftIdx + rightIdx) / 2);
    while (leftIdx + 1 < rightIdx) {
        if (searchSpace[midPoint] === valToFind) {
            midPoint--;
            break;
        }

        if (searchSpace[midPoint] < valToFind) {
            leftIdx = midPoint;
            midPoint = Math.floor((leftIdx + rightIdx) / 2);
        } else {
            rightIdx = midPoint;
            midPoint = Math.floor((leftIdx + rightIdx) / 2);
        }
    }
    return midPoint;
}

function findUpperBound(valToFind, searchSpace, leftIdx, rightIdx, extraParam) {
    var midPoint = Math.ceil((leftIdx + rightIdx) / 2);
    while (leftIdx + 1 < rightIdx) {
        if (searchSpace[midPoint] === valToFind) {
            midPoint++;
            break;
        }

        if (searchSpace[midPoint] < valToFind) {
            leftIdx = midPoint;
            midPoint = Math.ceil((leftIdx + rightIdx) / 2);
        } else {
            rightIdx = midPoint;
            midPoint = Math.ceil((leftIdx + rightIdx) / 2);
        }
    }
    return midPoint;
}
