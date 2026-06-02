var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = fileContent.trim().split("\n");
var linePointer = 0;

function fetchNextLine() {
    return lineBuffer[linePointer++];
}

function extractParameters(paramLine) {
    var parts = paramLine.split(" ").map(Number);
    return { count: parts[0], sumLimit: parts[1] };
}

while (true) {
    var currentLineData = fetchNextLine();
    var { count: countElements, sumLimit: targetSum } = extractParameters(currentLineData);

    if (countElements === 0 && targetSum === 0) {
        break;
    }

    var dataValues = [];
    for (var idxA = 0; idxA < countElements; idxA++) {
        var rawValue = fetchNextLine();
        var parsedValue = Number(rawValue);
        dataValues.push(parsedValue);
    }

    dataValues.sort(function(valA, valB) { return valA - valB; });

    var resultCount = 0;
    for (var idxA = 0; idxA < countElements; idxA++) {
        var currentValA = dataValues[idxA];
        for (var idxB = idxA + 1; idxB < countElements; idxB++) {
            var currentValB = dataValues[idxB];
            var currentPairSum = currentValA + currentValB;
            if (currentPairSum > targetSum) {
                resultCount += (countElements - idxB);
                break;
            }
        }
    }
    console.log(resultCount);
}
