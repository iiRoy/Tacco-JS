var inputBuffer = [];
var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (entry) {
    inputBuffer.push(entry);
});

inputHandler.on('close', function () {
    var arraySize = Number(inputBuffer[0]);
    var firstArr = inputBuffer[1].split(" ").map(Number);
    var midArr = inputBuffer[2].split(" ").map(Number);
    var lastArr = inputBuffer[3].split(" ").map(Number);

    firstArr.sort((val1, val2) => val1 - val2);
    midArr.sort((val1, val2) => val1 - val2);
    lastArr.sort((val1, val2) => val1 - val2);

    var totalCount = 0;
    var leftPointer = 0;
    var rightPointer = 0;

    for (var midIndex = 0; midIndex < arraySize; midIndex++) {
        var currentMidVal = midArr[midIndex];

        // Count elements in firstArr strictly less than currentMidVal
        while (leftPointer < arraySize && firstArr[leftPointer] < currentMidVal) {
            leftPointer++;
        }
        var countLeft = leftPointer;

        // Count elements in lastArr greater than or equal to currentMidVal
        // Advance rightPointer to the first element in lastArr that is >= currentMidVal
        while (rightPointer < arraySize && lastArr[rightPointer] < currentMidVal) {
            rightPointer++;
        }
        var countRight = arraySize - rightPointer;
        
        totalCount += countLeft * countRight;
    }
    console.log(totalCount);
});
