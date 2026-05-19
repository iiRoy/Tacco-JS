var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

var sizeParams = inputLines.shift().split(" ").map(Number);
var countD = sizeParams[0];
var countC = sizeParams[1];

var dataD = [];
for (var i = 0; i < countD; i++) {
    dataD.push(Number(inputLines.shift()));
}

var dataC = [];
for (var i = 0; i < countC; i++) {
    dataC.push(Number(inputLines.shift()));
}

var costMatrix = [];
for (var cIdx = 0; cIdx <= countC; cIdx++) {
    costMatrix.push(Array.from({ length: countD + 1 }, () => Infinity));
}
costMatrix[0][0] = 0;

for (var cIndex = 0; cIndex < countC; cIndex++) {
    var currentCValue = dataC[cIndex];
    for (var dIndex = 0; dIndex < countD; dIndex++) {
        var currentDValue = dataD[dIndex];

        const currentPathCost = costMatrix[cIndex][dIndex];
        if (currentPathCost === Infinity) {
            continue;
        }

        const costToAddD = currentCValue * currentDValue;

        for (var stepSize = 1; cIndex + stepSize <= countC; stepSize++) {
            const nextCIndex = cIndex + stepSize;

            costMatrix[nextCIndex][dIndex] = Math.min(
                costMatrix[nextCIndex][dIndex],
                currentPathCost
            );

            costMatrix[nextCIndex][dIndex + 1] = Math.min(
                costMatrix[nextCIndex][dIndex + 1],
                currentPathCost + costToAddD
            );
        }
    }
}

console.log(costMatrix[countC][countD]);
