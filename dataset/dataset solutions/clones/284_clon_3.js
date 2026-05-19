var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawData.trim().split("\n");

function parseDimensions(lineStr) {
    const parts = lineStr.split(" ").map(Number);
    return {
        nVal: parts[0],
        mVal: parts[1]
    };
}

while (true) {
    var currentLine = inputLines.shift();
    if (currentLine === "0 0") {
        break;
    }

    const dimensions = parseDimensions(currentLine);
    var numPeople = dimensions.nVal;
    var eliminationStep = dimensions.mVal;

    var isPersonActive = Array(numPeople + 1).fill(true);

    var personIndex = 1;
    var eliminationCounter = 0;
    var eliminatedCount = 0;

    const targetEliminations = numPeople - 1;

    while (true) {
        if (isPersonActive[personIndex]) {
            eliminationCounter++;
            if (eliminationCounter === eliminationStep) {
                isPersonActive[personIndex] = false;
                eliminationCounter = 0;
                eliminatedCount++;

                if (eliminatedCount === targetEliminations) {
                    break;
                }
            }
        }

        personIndex++;
        if (personIndex > numPeople) {
            personIndex = 1;
        }
    }

    for (var k = 1; k <= numPeople; k++) {
        if (isPersonActive[k]) {
            console.log(k);
            break;
        }
    }
}
