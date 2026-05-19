var INPUT_PARSER = (function() {
    // Factory function to create an InputReader instance
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    // Class to handle reading various data types from input string
    function InputReader(sourceString) {
        // Store input lines, trimmed and split by newline
        this._sourceLines = sourceString.trim().split("\n");
        // Current line index being processed
        this._currentLineIndex = 0;
    }

    // Method to read a single value from the current line
    // If 'asString' is true, returns string; otherwise, returns number
    InputReader.prototype.readNextValue = function(asString) {
        let lineData = this._sourceLines;
        let lineIdx = this._currentLineIndex;
        let parsedVal;

        // If the current line hasn't been processed into an array of values yet
        if (typeof lineData[lineIdx] === "string") {
            // Split the line by space and reverse to easily pop values from the end
            lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
        }

        // Pop the last value from the current line's array
        parsedVal = lineData[lineIdx].pop();

        // If the current line is exhausted, move to the next line
        if (!lineData[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or number based on 'asString' flag
        return asString ? parsedVal : +parsedVal;
    };

    // Method to read all values from the current line
    // If 'asString' is true, returns array of strings; otherwise, array of numbers
    InputReader.prototype.readLineValues = function(asString) {
        // Get the current line, split by space, and increment line index
        let valuesOnLine = this._sourceLines[this._currentLineIndex++].split(" ");
        return asString ? valuesOnLine : valuesOnLine.map(item => +item);
    };

    // Method to read a matrix (n lines, each split by space)
    // If 'asString' is true, returns matrix of strings; otherwise, matrix of numbers
    InputReader.prototype.readMatrix = function(numRows, asString) {
        // Slice 'numRows' lines, split each by space
        let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
        return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    // Method to read 'n' raw lines
    // If 'asString' is true, returns array of strings; otherwise, array of numbers
    InputReader.prototype.readRawLines = function(numLines, asString) {
        // Slice 'numLines' directly
        let rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return asString ? rawLines : rawLines.map(item => +item);
    };

    return createParser;
})();

// Initialize the input reader with content from standard input
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays initialized with a value
function createMultiDimArray(initialValue) {
    let args = arguments;
    let argCount = args.length;
    // Start building the array creation string from the innermost dimension
    let arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap with outer dimensions
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Evaluate the constructed string to create the array
    return eval(arrayCreationString);
}

// Global variables for problem data
var numItems; // Renamed from 'n'
var pointList = []; // Renamed from 'x'

// Execute the main problem-solving logic and print the result
console.log(solveProblem());

function solveProblem() {
    // Read the number of points from input
    numItems = inputData.readNextValue();

    // Loop to read point coordinates and calculate their angles
    for (let idx = 0; idx < numItems; idx++) {
        let coordA = inputData.readNextValue(); // Renamed from 'a'
        let coordB = inputData.readNextValue(); // Renamed from 'b'

        // Skip points that are at the origin (0,0)
        if (coordA === 0.0 && coordB === 0.0) {
            continue;
        }
        // Store [x, y, angle] for each valid point
        pointList.push([coordA, coordB, calculateAngleDegrees(coordA, coordB)]);
    }

    // Update numItems to reflect the actual count of non-origin points
    numItems = pointList.length;

    // Sort points by their calculated angle in ascending order
    pointList.sort((pt1, pt2) => pt1[2] - pt2[2]);

    // Duplicate the sorted list to handle circular arrangements (sweep line approach)
    pointList = pointList.concat(pointList);

    let maxSquaredDistance = 0.0; // Renamed from 'ans', initialized with float
    let currentTotalX = 0.0; // Renamed from 'tx'
    let currentTotalY = 0.0; // Renamed from 'ty'
    let windowEndIdx = 0; // Renamed from 'k'

    // Iterate through the extended list of points
    for (let idx = 0; idx < numItems; idx++) {
        // Expand the window (k) as long as adding the next vector increases the squared distance
        while (windowEndIdx < idx + numItems) {
            let potentialNextX = currentTotalX + pointList[windowEndIdx][0]; // Renamed from 'ux'
            let potentialNextY = currentTotalY + pointList[windowEndIdx][1]; // Renamed from 'uy'

            // Check if adding the next vector increases the squared distance from origin
            // If not, or if it decreases, we stop expanding the window
            if (currentTotalX * currentTotalX + currentTotalY * currentTotalY >= potentialNextX * potentialNextX + potentialNextY * potentialNextY) {
                break;
            }
            // Update current total vector components
            currentTotalX = potentialNextX;
            currentTotalY = potentialNextY;
            windowEndIdx++; // Move window end forward
        }

        // Calculate the squared distance for the current optimal window
        let currentSquaredDistance = currentTotalX * currentTotalX + currentTotalY * currentTotalY; // Renamed from 'u'
        // Update the maximum squared distance found so far
        if (maxSquaredDistance < currentSquaredDistance) {
            maxSquaredDistance = currentSquaredDistance;
        }

        // Shrink the window from the left by removing the current point's vector
        currentTotalX -= pointList[idx][0];
        currentTotalY -= pointList[idx][1];
    }

    // The problem asks for the distance, not squared distance
    return Math.sqrt(maxSquaredDistance);
}

// Function to calculate the angle in degrees for a given (deltaX, deltaY) vector
function calculateAngleDegrees(deltaX, deltaY) { // Renamed from 'f', 'a', 'b'
    // Handle special cases for axes to avoid division by zero and ensure correct quadrant
    if (deltaX === 0.0) {
        // If deltaX is 0, angle is 90 (positive Y) or 270 (negative Y)
        return deltaY > 0.0 ? 90.0 : 270.0;
    }
    if (deltaY === 0.0) {
        // If deltaY is 0, angle is 0 (positive X) or 180 (negative X)
        return deltaX > 0.0 ? 0.0 : 180.0;
    }

    // Calculate angle using arctangent, convert from radians to degrees
    let angleInDegrees = Math.atan(deltaY / deltaX) / Math.PI * 180.0; // Renamed from 'r'

    // Adjust angle based on quadrant
    if (deltaX < 0.0) {
        angleInDegrees += 180.0; // Quadrants II and III
    }
    if (angleInDegrees < 0.0) {
        angleInDegrees += 360.0; // Ensure angle is positive (0 to 360)
    }

    // Round to a high precision to handle floating point inaccuracies consistently
    return Math.round(angleInDegrees * 10_000_000.0) / 10_000_000.0; // Using numeric separator for readability
}
