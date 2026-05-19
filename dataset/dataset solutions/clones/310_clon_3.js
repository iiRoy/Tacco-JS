function processMatrixData() {
    var matrixDim = getNextInputToken();
    var dataMatrix = initializeMatrix(matrixDim);

    computeRowPrefixSums(dataMatrix, matrixDim);

    var overallMaxSum = findMaxSubmatrixSum(dataMatrix, matrixDim);

    displayOutput(overallMaxSum);
}

function initializeMatrix(dim) {
    var matrix = [];
    iterateWithIndex(dim, function(rowIndex) {
        matrix[rowIndex] = [];
        iterateWithIndex(dim, function(colIndex) {
            matrix[rowIndex][colIndex] = getNextInputToken();
        });
    });
    return matrix;
}

function computeRowPrefixSums(matrix, dim) {
    iterateWithIndex(dim, function(rowIndex) {
        matrix[rowIndex][-1] = 0;
        iterateWithIndex(dim, function(colIndex) {
            matrix[rowIndex][colIndex] += matrix[rowIndex][colIndex - 1];
        });
    });
}

function findMaxSubmatrixSum(matrix, dim) {
    var currentOverallMaxSum = -Infinity;

    iterateWithIndex(-1, dim - 1, function(leftColIdx) {
        iterateWithIndex(leftColIdx + 1, dim, function(rightColIdx) {
            var columnSliceSums = [];

            iterateWithIndex(0, dim, function(rowIndex) {
                columnSliceSums[rowIndex] = matrix[rowIndex][rightColIdx] - matrix[rowIndex][leftColIdx];
            });

            var currentSliceMax = calculateKadaneMax(columnSliceSums);
            currentOverallMaxSum = Math.max(currentOverallMaxSum, currentSliceMax);
        });
    });
    return currentOverallMaxSum;
}

function calculateKadaneMax(sliceArray) {
    if (sliceArray.length === 0) {
        return -Infinity;
    }

    var kadaneResults = [];
    kadaneResults[0] = sliceArray[0];

    iterateWithIndex(1, sliceArray.length, function(idx) {
        kadaneResults[idx] = Math.max(kadaneResults[idx - 1] + sliceArray[idx], sliceArray[idx]);
    });

    var maxValInKadaneResults = -Infinity;
    iterateWithIndex(0, kadaneResults.length, function(idx) {
        if (kadaneResults[idx] > maxValInKadaneResults) {
            maxValInKadaneResults = kadaneResults[idx];
        }
    });
    return maxValInKadaneResults;
}

function iterateWithIndex(startOrCount, endOrCallback, callbackIfRange) {
    var startValue, endValue, loopAction;

    if (callbackIfRange == null) {
        startValue = 0;
        endValue = startOrCount;
        loopAction = endOrCallback;
    } else {
        startValue = startOrCount;
        endValue = endOrCallback;
        loopAction = callbackIfRange;
    }

    for (var currentIdx = startValue; currentIdx < endValue; ++currentIdx) {
        loopAction(currentIdx);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawInputBuffer = '';
var currentTokenPosition = 0;

function getNextInputToken(tokenType) {
    if (tokenType === 'string') {
        return rawInputBuffer[currentTokenPosition++];
    } else {
        return +rawInputBuffer[currentTokenPosition++];
    }
}

function displayOutput(valueToPrint) {
    console.log(valueToPrint);
}

process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    processMatrixData();
});
