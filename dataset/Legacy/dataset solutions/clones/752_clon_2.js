var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = rawData.trim().split("\n");

while (true) {
    var currentLine = lineSegments.shift();

    if (currentLine === "0 0 0 0 0") {
        break;
    }

    var numericValues = (currentLine + " " + lineSegments.shift()).split(" ").map(Number);

    (function (val1, val2, val3, val4, val5, countA, countB, countC) {
        var resultOne, resultTwo;
        var remainderVal = countC % val4;

        resultOne = countA * val1 + countB * val2 + Math.floor(countC / val4) * val4 * val5 + remainderVal * val3;

        if (countC >= val4) {
            resultTwo = countA * val1 + countB * val2 + countC * val5;
        }

        if (countC < val4) {
            var deficit = val4 - remainderVal;
            while (deficit--) {
                if (countB > 0) {
                    countB--;
                } else if (countA > 0) {
                    countA--;
                }
            }
            resultTwo = countA * val1 + countB * val2 + val4 * val5;
        }

        console.log(Math.min(resultOne, resultTwo));
    }).apply(null, numericValues);
}
