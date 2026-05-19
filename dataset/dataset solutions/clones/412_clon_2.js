var permutationsStore = [""];

for (var currentSize = 1; currentSize <= 10; currentSize++) {
    permutationsStore[currentSize] = [];
    var availableIndices = [];
    for (var idx = 0; idx < currentSize; idx++) {
        availableIndices[idx] = true;
    }

    var generatePermutations = function (currentPermutation) {
        if (currentPermutation.length === currentSize) {
            permutationsStore[currentSize].push(currentPermutation);
        } else {
            for (var idx = 0; idx < currentSize; idx++) {
                if (availableIndices[idx]) {
                    availableIndices[idx] = false;
                    generatePermutations(currentPermutation + idx);
                    availableIndices[idx] = true;
                }
            }
        }
    };
    generatePermutations("");
}

var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContent.trim().split("\n");

while (true) {
    var numItems = inputLines.shift() - 0;
    if (numItems === 0) {
        break;
    }

    var itemDetails = [];
    for (var idx = 0; idx < numItems; idx++) {
        itemDetails[idx] = inputLines.shift().split(" ");
    }

    var minWeightedSum = Infinity;
    var minIndex;

    permutationsStore[numItems].forEach(function (permutationStr, permIdx) {
        var currentWeightSum = 0;
        var weightedSum = 0;
        var isValidOrder = true;

        for (var idx = 0; idx < numItems; idx++) {
            var itemIndex = permutationStr[idx] - 0;
            var itemWeight = itemDetails[itemIndex][1] - 0;
            var itemStrength = itemDetails[itemIndex][2] - 0;

            if (currentWeightSum > itemStrength) {
                isValidOrder = false;
                break;
            }
            currentWeightSum += itemWeight;
            weightedSum += itemWeight * (numItems - idx);
        }

        if (isValidOrder === false) {
            weightedSum = weightedSum / currentWeightSum;
            if (minWeightedSum > weightedSum) {
                minIndex = permIdx;
                minWeightedSum = weightedSum;
            }
        }
    });

    permutationsStore[numItems][minIndex].split("").map(Number).reverse().forEach(function (itemCode) {
        console.log(itemDetails[itemCode][0]);
    });
}
