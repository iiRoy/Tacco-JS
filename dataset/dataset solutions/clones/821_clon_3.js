var countVal;
var cumulativeSums = [];

function initializeSums() {
    cumulativeSums[0] = 0;
    for (var idx = 1; idx < countVal; ++idx) {
        var previousSum = cumulativeSums[idx - 1];
        cumulativeSums[idx] = previousSum + idx;
    }
}

function findValue(targetVal) {
    var leftIdx = 0;
    var rightIdx = countVal;
    while (rightIdx - leftIdx > 1) {
        var midIdx = Math.floor((leftIdx + rightIdx) / 2);
        if (cumulativeSums[midIdx] <= targetVal) {
            leftIdx = midIdx;
        } else {
            rightIdx = midIdx;
        }
    }
    return cumulativeSums[leftIdx] === targetVal;
}

function processInput() {
    var currentNValue;
    while ((currentNValue = readNumber()) !== 0) {
        countVal = currentNValue;
        initializeSums();
        var finalCount = 0;
        for (var idx = 0; idx < countVal - 1; ++idx) {
            var valueToSearch = cumulativeSums[idx] + countVal;
            if (findValue(valueToSearch)) {
                ++finalCount;
            }
        }
        outputResult(finalCount);
    }
}

var rawData = '';

function readNumber() {
    var poppedValue = rawData.pop();
    return poppedValue !== undefined ? +poppedValue : 0;
}

function readString() {
    return rawData.pop();
}

function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    rawData += dataChunk;
});
process.stdin.on('end', function() {
    rawData = rawData.trim().split(/\s+/).reverse();
    processInput();
});
