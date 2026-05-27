var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.trim()).split("\n");
var numCases = lineData.shift() - 0;

function determineCircleRelation(x1, y1, r1, x2, y2, r2) {
    var finalResultCode;

    var deltaX = x1 - x2;
    var deltaY = y1 - y2;

    var deltaXSquared = deltaX * deltaX;
    var deltaYSquared = deltaY * deltaY;

    var centerDistance = Math.sqrt(deltaXSquared + deltaYSquared);

    var radiiSum = r1 + r2;
    var radiiDifferenceA = r1 - r2;
    var radiiDifferenceB = r2 - r1;

    if (centerDistance > radiiSum) {
        finalResultCode = 0;
    } else {
        finalResultCode = 1;

        if (centerDistance <= radiiDifferenceA) {
            finalResultCode = 2;
        }
        if (centerDistance <= radiiDifferenceB) {
            finalResultCode = -2;
        }
    }
    return finalResultCode;
}

for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    var currentCaseParams = lineData[caseIndex].split(" ").map(Number);
    var relationCode = determineCircleRelation(...currentCaseParams);
    console.log(relationCode);
}
