var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = rawData.trim().split("\n");
var [targetVal, factorA, priceB, factorC, priceD] = inputLines.shift().split(" ").map(Number);

var lowestPrice = Infinity;
for (var counterX = 0; counterX <= 1000; counterX++) {
    for (var counterY = 0; counterY <= 1000; counterY++) {
        if (factorA * counterX + factorC * counterY >= targetVal) {
            lowestPrice = Math.min(lowestPrice, priceB * counterX + priceD * counterY);
        }
    }
}
console.log(lowestPrice);
