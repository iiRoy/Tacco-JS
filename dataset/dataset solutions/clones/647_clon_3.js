var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = rawData.trim().split("\n");
var firstLineData = lines.shift().split(" ");

var targetQuantity = Number(firstLineData[0]);
var packAQuantity = Number(firstLineData[1]);
var packACost = Number(firstLineData[2]);
var packBQuantity = Number(firstLineData[3]);
var packBCost = Number(firstLineData[4]);

var minimumOverallCost = Infinity;

function calculateOptionCost(requiredAmount, itemsPerUnit, costPerUnit, maxIterations) {
    let currentOptionMinimum = Infinity;
    for (let unitCount = 0; unitCount <= maxIterations; unitCount++) {
        let totalItemsObtained = itemsPerUnit * unitCount;
        if (totalItemsObtained >= requiredAmount) {
            let currentCalculatedCost = costPerUnit * unitCount;
            currentOptionMinimum = Math.min(currentOptionMinimum, currentCalculatedCost);
        }
    }
    return currentOptionMinimum;
}

let costFromOptionA = calculateOptionCost(targetQuantity, packAQuantity, packACost, 1000);
let costFromOptionB = calculateOptionCost(targetQuantity, packBQuantity, packBCost, 1000);

minimumOverallCost = Math.min(costFromOptionA, costFromOptionB);

console.log(minimumOverallCost);
