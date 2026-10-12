var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (rawData.trim()).split("\n");

while (true) {
    var initialCount = parseInt(lineSegments.shift(), 10);
    if (initialCount === 0) {
        break;
    }

    var baseValues = lineSegments.shift().split(" ").map(Number);
    var adjustmentValues = lineSegments.shift().split(" ").map(Number);

    var initialBaseSum = baseValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    adjustmentValues.sort((a, b) => b - a);

    var cumulativeAdjustments = adjustmentValues.reduce((acc, val) => {
        const lastCumulative = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(lastCumulative + val);
        return acc;
    }, []);

    var allPossibleSums = [initialBaseSum].concat(
        cumulativeAdjustments.map(cumAdj => initialBaseSum + cumAdj)
    );

    var allPossibleCounts = Array.from({ length: adjustmentValues.length + 1 }, (_, index) => initialCount - index);

    var peakProduct = allPossibleSums.reduce((currentMaximum, currentSum, index) => {
        const correspondingCount = allPossibleCounts[index];
        return Math.max(currentMaximum, currentSum * correspondingCount);
    }, -Infinity);

    console.log(peakProduct);
}
