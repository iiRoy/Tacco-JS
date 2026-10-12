var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

function calculateMinimumSumForValue(inputValue) {
    if (inputValue === 0) {
        return null; // Special return to signal termination
    }

    var minimumSumFound = Infinity;

    for (var iterZ = 0; iterZ <= 100; iterZ++) {
        // Introduce a temporary variable for z cubed
        var zCubed = iterZ * iterZ * iterZ;

        for (var iterY = 0; iterY <= 1000; iterY++) {
            // Introduce a temporary variable for y squared
            var ySquared = iterY * iterY;

            // Calculate the potential value for x
            var potentialX = inputValue - zCubed + ySquared;

            // If potentialX is negative, further increasing iterY will also result in negative potentialX,
            // so we can break the inner loop for efficiency.
            if (potentialX < 0) {
                break;
            }

            // Calculate the sum of iterZ, iterY, and potentialX
            var currentIterationSum = iterZ + iterY + potentialX;

            // Update the overall minimum sum
            minimumSumFound = Math.min(minimumSumFound, currentIterationSum);
        }
    }
    return minimumSumFound;
}

while (true) {
    var currentLineString = lineData.shift();
    // Convert the string input to a number using the unary plus operator
    var numericValue = +currentLineString;

    var resultForCurrentValue = calculateMinimumSumForValue(numericValue);

    // If the helper function returned null, it means the input was 0, so we exit the loop.
    if (resultForCurrentValue === null) {
        break;
    }

    console.log(resultForCurrentValue);
}
