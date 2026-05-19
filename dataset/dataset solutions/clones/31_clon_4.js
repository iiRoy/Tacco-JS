var dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
var cycleCount = Number(dataStream);
var startingAmount = 100000;

var finalCapital = Array.from({ length: cycleCount }).reduce((currentCapital, _, iterationIndex) => {
    let projectedCapital = currentCapital * 1.05;
    let adjustedCapital = Math.floor((projectedCapital + 999) / 1000) * 1000;
    return adjustedCapital;
}, startingAmount);

console.log(finalCapital);
