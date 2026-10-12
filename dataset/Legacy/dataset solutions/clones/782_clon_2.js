var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n");

var idx = 0;

var outputBuffer = "";

while (true) {
    var currentValue = lineSegments.shift() - 0;

    if (currentValue === 0) {
        break;
    }

    var denominationsCount = (lineSegments.shift()).split(" ").map(Number);

    var remainingChange = (10 * denominationsCount[0] + 50 * denominationsCount[1] + 100 * denominationsCount[2] + 500 * denominationsCount[3]) - currentValue;

    var calculatedChange = [0, 0, 0, 0];

    while (500 <= remainingChange) {
        calculatedChange[3]++;
        remainingChange -= 500;
    }
    while (100 <= remainingChange) {
        calculatedChange[2]++;
        remainingChange -= 100;
    }
    while (50 <= remainingChange) {
        calculatedChange[1]++;
        remainingChange -= 50;
    }
    while (10 <= remainingChange) {
        calculatedChange[0]++;
        remainingChange -= 10;
    }

    var coinValues = [10, 50, 100, 500];

    denominationsCount.forEach(function (initialCount, denominationIndex) {
        if (initialCount > calculatedChange[denominationIndex]) {
            outputBuffer += coinValues[denominationIndex] + " " + (initialCount - calculatedChange[denominationIndex]) + "\n";
        }
    });

    outputBuffer += "\n";
}

console.log(outputBuffer);
