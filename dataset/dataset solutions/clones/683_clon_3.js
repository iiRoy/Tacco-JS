var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()).split("\n");

while (true) {
    var [countElements, targetSum] = lineData.shift().split(" ").map(Number);

    if (countElements === 0 && targetSum === 0) {
        break;
    }

    var numericArray = [];
    var arrayPopulateLimit = countElements;
    for (var idx = 0; idx < arrayPopulateLimit; idx++) {
        var currentNumString = lineData.shift();
        var currentNumValue = Number(currentNumString);
        numericArray.push(currentNumValue);
    }

    function compareNumbers(valA, valB) {
        return valA - valB;
    }
    numericArray.sort(compareNumbers);

    var pairCount = 0;
    var outerLoopMax = countElements;
    for (var idxA = 0; idxA < outerLoopMax; idxA++) {
        var innerLoopMax = countElements;
        for (var idxB = idxA + 1; idxB < innerLoopMax; idxB++) {
            var elementA = numericArray[idxA];
            var elementB = numericArray[idxB];
            var currentPairSum = elementA + elementB;

            if (currentPairSum > targetSum) {
                var remainingCountForThis_idxA = innerLoopMax - idxB;
                pairCount += remainingCountForThis_idxA;
            }
        }
    }
    console.log(pairCount);
}
