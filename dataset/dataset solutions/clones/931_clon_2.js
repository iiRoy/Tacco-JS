var rawData = require('fs') .readFileSync('/dev/stdin', 'utf8') .trim();

var textRows = rawData.split('\n');

var matrixCount = Number(textRows.shift());

var dimensions = [];

for ( var outerIdx = 1; outerIdx <= matrixCount; outerIdx++ ) {
    var tempDims = textRows.shift().split(' ');
    dimensions[outerIdx] = Number(tempDims[0]);
    dimensions[outerIdx + 1] = Number(tempDims[1]);
}

var minMultiplicationCosts = [[-1]];

for ( let rowIdx = 1; rowIdx <= matrixCount; rowIdx++ ) {
    let currentCostRow = [-1];
    minMultiplicationCosts.push(currentCostRow);
    for ( let colIdx = 1; colIdx <= matrixCount; colIdx++ ) {
        minMultiplicationCosts[rowIdx][colIdx] = Number.POSITIVE_INFINITY;
    }
}

for ( let diagIdx = 1; diagIdx <= matrixCount; diagIdx++ ) {
    minMultiplicationCosts[diagIdx][diagIdx] = 0;
}

for ( let lengthOffset = 1; lengthOffset < matrixCount; lengthOffset++ ) {
    for ( let firstIdx = 1; firstIdx <= matrixCount - lengthOffset; firstIdx++ ) {
        for ( let splitPoint = firstIdx + 1; splitPoint <= firstIdx + lengthOffset; splitPoint++ ) {
            let currentProductCost = minMultiplicationCosts[firstIdx][splitPoint - 1] + minMultiplicationCosts[splitPoint][firstIdx + lengthOffset] + dimensions[firstIdx] * dimensions[splitPoint] * dimensions[firstIdx + lengthOffset + 1];
            if ( currentProductCost < minMultiplicationCosts[firstIdx][firstIdx + lengthOffset] ) {
                minMultiplicationCosts[firstIdx][firstIdx + lengthOffset] = currentProductCost;
            }
        }
    }
}

console.log(minMultiplicationCosts[1][matrixCount]);