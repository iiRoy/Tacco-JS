var inputLines = [];
var ioModule = require('readline');

var inputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function computePower(base, exponent) {
    return Math.pow(base, exponent);
}

inputInterface.on('line', function (currentInputLine) {
    inputLines.push(currentInputLine);
});

inputInterface.on('close', function () {
    var targetNumericValue = Number(inputLines[0]);
    var maxValidPower;

    for (var baseCandidate = 1; baseCandidate <= targetNumericValue; baseCandidate++) {
        var currentBaseSquared = computePower(baseCandidate, 2);

        if (currentBaseSquared > targetNumericValue) {
            break;
        }

        if (currentBaseSquared <= targetNumericValue) {
            maxValidPower = currentBaseSquared;
        }
    }

    console.log(maxValidPower);
});
