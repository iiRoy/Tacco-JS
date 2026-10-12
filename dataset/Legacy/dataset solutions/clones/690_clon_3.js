var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var trimmedInput = rawData.trim();
var inputLines = trimmedInput.split("\n");

function calculateMinimumPositiveDifference(baseNumber) {
    var baseNumberCubed = Math.pow(baseNumber, 3);
    var candidateDifferences = [];

    for (var firstFactor = baseNumber - 1; firstFactor > 0; firstFactor--) {
        var firstFactorCubed = Math.pow(firstFactor, 3);

        for (var secondFactor = firstFactor; secondFactor > 0; secondFactor--) {
            var secondFactorCubed = Math.pow(secondFactor, 3);

            var currentDifference = baseNumberCubed - firstFactorCubed - secondFactorCubed;

            if (currentDifference > 0) {
                candidateDifferences.push(currentDifference);
            }
        }
    }
    return Math.min.apply(null, candidateDifferences);
}

while (true) {
    var currentInputNumber = Number(inputLines.shift());

    if (currentInputNumber === 0) {
        break;
    }

    var result = calculateMinimumPositiveDifference(currentInputNumber);
    console.log(result);
}
