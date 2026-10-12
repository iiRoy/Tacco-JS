var inputLines = [];
var lineReaderModule = require('readline');

var inputHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLineText) {
    inputLines.push(currentLineText);
});

inputHandler.on('close', function () {
    var firstInputLine = inputLines.shift();
    var lineParts = firstInputLine.split(" ");

    var numElements = Number(lineParts[0]);
    var countA = Number(lineParts[1]);
    var countB = Number(lineParts[2]);

    var dataValues = Array(numElements);

    var secondInputLineParts = inputLines.shift().split(" ");
    for (var idx = 0; idx < numElements; idx++) {
        dataValues[idx] = Number(secondInputLineParts[idx]);
    }

    dataValues.sort(function (val1, val2) { return (val2 - val1); });

    var maxAverageValue = 0;
    var frequencyMap = {};

    const updateFrequency = (value, map) => {
        map[value] = (map[value] || 0) + 1;
    };

    for (var idx = 0; idx < numElements; idx++) {
        let currentValue = dataValues[idx];
        if (idx < countA) {
            maxAverageValue += currentValue;
        }
        updateFrequency(currentValue, frequencyMap);
    }
    maxAverageValue /= countA;
    console.log(maxAverageValue);

    var processedCount = 0;
    var totalCombinations;

    if (dataValues[0] !== dataValues[countA]) {
        totalCombinations = 1;
        for (var loopIdx = 0; loopIdx < numElements; loopIdx++) {
            let currentVal = dataValues[loopIdx];
            let currentValFreq = frequencyMap[currentVal];

            if (currentValFreq >= 2) {
                let k = Math.min(currentValFreq, countA - processedCount);
                totalCombinations *= calculateCombinations(currentValFreq, k);
            }
            
            processedCount += currentValFreq;
            loopIdx += currentValFreq - 1;
        }
    } else {
        totalCombinations = 0;
        for (var k = 1; k <= countB; k++) {
            totalCombinations += calculateCombinations(50, k);
        }
    }
    console.log(totalCombinations);
});

function calculatePermutations(total, select) {
    var result = 1;
    for (var loopVar = 0; loopVar < select; loopVar++) {
        result *= total - loopVar;
    }
    return result;
}

function calculateCombinations(total, select) {
    if (select < 0 || select > total) {
        return 0;
    }
    if (select === 0 || select === total) {
        return 1;
    }
    if (select > total / 2) {
        select = total - select;
    }
    return calculatePermutations(total, select) / calculatePermutations(select, select);
}
