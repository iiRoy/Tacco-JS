var parseInteger = val => parseInt(val, 10);
var parseIntegerArray = inputArray => inputArray.map(element => parseInteger(element));
var absoluteValue = num => num > 0 ? num : -num;

function findMinimum() {
    var args = arguments,
        currentMin = args[0];
    for (var idx = 1; idx < args.length; idx++)
        if (args[idx] < currentMin) currentMin = args[idx];
    return currentMin;
}

function findMaximum() {
    var params = arguments,
        currentMax = params[0];
    for (var k = 1; k < params.length; k++)
        if (params[k] > currentMax) currentMax = params[k];
    return currentMax;
}

function greatestCommonDivisor() {
    var values = arguments,
        result = values[0],
        gcdHelper = (numA, numB) => numB ? gcdHelper(numB, numA % numB) : numA;
    for (var j = 1; j < values.length; j++)
        result = gcdHelper(result, values[j]);
    return result;
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInputData(rawData) {
    // Split the raw input string into an array of lines.
    var lines = rawData.split('\n');
    var numPoints = parseInteger(lines[0]);
    var coordinates = [];

    // Iterate through each line representing a point's coordinates.
    for (var pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        coordinates[pointIndex] = parseIntegerArray(lines[pointIndex + 1].split(' '));
        // Check a specific parity condition for the first point and current point.
        // If the sum of x+y for the first point and current point is odd, output -1 and exit.
        if ((coordinates[pointIndex][0] + coordinates[pointIndex][1] + coordinates[0][0] + coordinates[0][1]) % 2 !== 0) {
            console.log(-1);
            return 0;
        }
    }

    // Determine the parity offset based on the first point's coordinates.
    var parityOffset = (coordinates[0][0] + coordinates[0][1]) % 2;
    if (parityOffset === 1) {
        // If the parity offset is 1, reverse the coordinates of points where the x-coordinate is odd.
        coordinates = coordinates.map(coordPair => coordPair[0] % 2 === 0 ? coordPair : coordPair.reverse());
    }

    /*
     * This section calculates the total number of direction steps.
     * The base value is 20.
     * It's incremented if the first point's x or y coordinate is odd.
     */
    var directionCount = 20;
    if (coordinates[0][0] % 2 === 1) directionCount++;
    if (coordinates[0][1] % 2 === 1) directionCount++;
    console.log(directionCount);

    // Create an array of direction steps, all initialized to 1, and join them into a string.
    var directionSteps = [];
    directionSteps.length = directionCount;
    directionSteps.fill(1);
    directionSteps = directionSteps.join(' ');
    console.log(directionSteps);

    // For each point, generate a sequence of movement characters.
    for (var currentPointIdx = 0; currentPointIdx < numPoints; currentPointIdx++) {
        var outputString = '';
        var currentCoords = coordinates[currentPointIdx];

        // Adjust coordinates and append 'R' if x or y is odd.
        if (currentCoords[0] % 2 === 1) {
            outputString += 'R';
            currentCoords[0]++;
        }
        if (currentCoords[1] % 2 === 1) {
            outputString += 'R';
            currentCoords[1]++;
        }

        // Append 'R', 'L', 'U', 'D' characters based on adjusted coordinates.
        outputString += ''.padEnd((10 + currentCoords[0]) / 2, 'R');
        outputString += ''.padEnd((10 - currentCoords[0]) / 2, 'L');
        outputString += ''.padEnd((10 + currentCoords[1]) / 2, 'U');
        outputString += ''.padEnd((10 - currentCoords[1]) / 2, 'D');
        console.log(outputString);
    }

    return 0;
}
