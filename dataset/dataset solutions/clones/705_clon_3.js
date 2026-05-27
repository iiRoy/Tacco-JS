var countA, countB;
var arrA = [], arrB = [];

function findValueInSortedArray(searchValue) {
    var lowIdx = 0, highIdx = countB;
    while (highIdx - lowIdx > 1) {
        var midIdx = Math.floor((lowIdx + highIdx) / 2);
        if (arrB[midIdx] <= searchValue) {
            lowIdx = midIdx;
        } else {
            highIdx = midIdx;
        }
    }
    return arrB[lowIdx] === searchValue;
}

function readNumericArray(size) {
    const newArray = new Array(size);
    for (let idx = 0; idx < size; ++idx) {
        newArray[idx] = getNextInputToken();
    }
    return newArray;
}

function processDataSet() {
    while (countA = getNextInputToken()) {
        countB = getNextInputToken();

        arrA = readNumericArray(countA);
        arrB = readNumericArray(countB);

        arrA.sort(function(val1, val2) {
            return val1 - val2;
        });
        arrB.sort(function(val1, val2) {
            return val1 - val2;
        });

        const sumA = arrA.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const sumB = arrB.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        const totalDifference = sumB - sumA;
        const targetDifference = Math.floor(totalDifference / 2);

        if (totalDifference % 2 !== 0) {
            outputResult(-1);
            continue;
        }

        let foundPair = false;
        
        for (let idx = 0; idx < countA; ++idx) {
            const requiredValueInB = arrA[idx] + targetDifference;
            if (findValueInSortedArray(requiredValueInB)) {
                outputResult(arrA[idx] + ' ' + requiredValueInB);
                foundPair = true;
                break;
            }
        }

        if (!foundPair) {
            outputResult(-1);
        }
    }
}

function iterateRange(param1, param2, param3) {
    let loopStart = 0;
    let loopEnd = param1;
    let loopCallback = param2;

    if (param3 !== undefined) {
        loopStart = param1;
        loopEnd = param2;
        loopCallback = param3;
    }

    for (let currentIdx = loopStart; currentIdx < loopEnd; ++currentIdx) {
        if (loopCallback(currentIdx) === false) {
            break;
        }
    }
}

var rawInputTokens = '';

function getNextInputToken() {
    const token = rawInputTokens.pop();
    return +token;
}

function getNextInputString() {
    return rawInputTokens.pop();
}

function outputResult(valueToPrint) {
    console.log(valueToPrint);
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputTokens += chunk;
});
process.stdin.on('end', function() {
    rawInputTokens = rawInputTokens.trim().split(/\s+/).reverse();
    processDataSet();
});
