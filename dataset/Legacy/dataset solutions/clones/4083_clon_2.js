var InputDataProcessor = (function() {
    // This factory function creates and returns a new instance of the InputBuffer.
    function createInputProcessor(inputStringContent) {
        return new InputBuffer(inputStringContent);
    }

    // The InputBuffer constructor initializes the data source.
    // It takes a raw string, trims it, and splits it into an array of lines.
    function InputBuffer(inputStringContent) {
        this.sourceLines = inputStringContent.trim().split("\n");
        this.currentLinePointer = 0; // Points to the next line to be processed.
    }

    // Reads a single value from the current line.
    // Values on a line are assumed to be space-separated.
    // The method reads values from right to left on the current line.
    // If 'returnAsString' is true, the value is returned as a string; otherwise, it's converted to a number.
    InputBuffer.prototype.readSingleValue = function(returnAsString) {
        var currentLineArray = this.sourceLines;
        var lineIndex = this.currentLinePointer;
        var extractedToken;

        // If the current line is still a single string, split it into tokens and reverse for efficient 'pop'.
        if (typeof currentLineArray[lineIndex] === "string") {
            currentLineArray[lineIndex] = currentLineArray[lineIndex].split(" ").reverse();
        }

        // Retrieve the last token from the (reversed) array, effectively the first token from the original line.
        extractedToken = currentLineArray[lineIndex].pop();

        // If the current line has no more tokens, advance the line pointer to the next line.
        if (!currentLineArray[lineIndex].length) {
            this.currentLinePointer++;
        }

        // Return the token, applying numeric conversion if 'returnAsString' is false.
        return returnAsString ? extractedToken : +extractedToken;
    };

    // Reads the entire current line and returns it as an array of values.
    // If 'returnStrings' is true, elements are strings; otherwise, they are numbers.
    InputBuffer.prototype.readLineAsArray = function(returnStrings) {
        // Fetch the current line, split it by spaces, and then increment the line pointer.
        var lineTokens = this.sourceLines[this.currentLinePointer++].split(" ");
        return returnStrings ? lineTokens : lineTokens.map(tokenStr => +tokenStr);
    };

    // Reads a specified number of lines ('numberOfLines') and processes them as a matrix.
    // Each line is treated as a row, and values within a row are space-separated.
    // If 'keepStrings' is true, the matrix contains string values; otherwise, numeric values.
    InputBuffer.prototype.readMultiLineMatrix = function(numberOfLines, keepStrings) {
        // Extract the relevant lines and map each line string to an array of its tokens.
        var matrixRows = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer += numberOfLines)
                                         .map(rowString => rowString.split(" "));

        // If numeric conversion is required, apply it to every cell in the matrix.
        return keepStrings ? matrixRows : matrixRows.map(row => row.map(cellString => +cellString));
    };

    // Reads a specified number of lines ('lineCount') and returns them as a flat array.
    // If 'asRawStrings' is true, the array contains raw line strings; otherwise, numeric values.
    InputBuffer.prototype.readMultiLineArray = function(lineCount, asRawStrings) {
        // Extract the specified number of lines.
        var resultLines = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer += lineCount);
        // Apply numeric conversion if 'asRawStrings' is false.
        return asRawStrings ? resultLines : resultLines.map(lineContent => +lineContent);
    };

    return createInputProcessor;
})();

// Initialize the input data reader by reading the content of standard input.
var dataReader = InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and print its result to the console.
console.log(checkTravelPlan());

/**
 * Determines if a given travel plan is feasible.
 * The plan consists of a sequence of points (time, x, y).
 * A move from (currentX, currentY) at 'elapsedTime' to (targetX, targetY) at 'targetTime' is valid if:
 * 1. The Manhattan distance (|currentX - targetX| + |currentY - targetY|) is less than or equal to the time difference (targetTime - elapsedTime).
 * 2. The parity (even/odd) of the Manhattan distance is the same as the parity of the time difference.
 *
 * @returns {string} "Yes" if the entire plan is feasible, "No" otherwise.
 */
function checkTravelPlan() {
    // Read the total number of travel points from the input.
    var totalSteps = dataReader.readSingleValue();

    // Read all travel points. Each point is an array [time, x, y].
    var stepCoordinates = dataReader.readMultiLineMatrix(totalSteps);

    // Initialize the starting state: time and coordinates.
    var elapsedTime = 0;
    var currentPosX = 0;
    var currentPosY = 0;

    // Iterate through each planned step to validate the travel plan.
    for (var stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
        // Calculate the Manhattan distance required to reach the next target point.
        var requiredDistance = Math.abs(currentPosX - stepCoordinates[stepIndex][1]);
        requiredDistance += Math.abs(currentPosY - stepCoordinates[stepIndex][2]);

        // Calculate the time available for this specific step.
        var timeDifference = stepCoordinates[stepIndex][0] - elapsedTime;

        // Check the two feasibility conditions:
        // 1. Is the required distance greater than the available time?
        // 2. Do the parities of distance and time difference not match?
        if (requiredDistance > timeDifference || requiredDistance % 2 !== timeDifference % 2) {
            return "No"; // If any condition fails, the plan is impossible.
        }

        // Update the current state to the target of the current step for the next iteration.
        currentPosX = stepCoordinates[stepIndex][1];
        currentPosY = stepCoordinates[stepIndex][2];
        elapsedTime = stepCoordinates[stepIndex][0];
    }

    // If all steps were successfully validated, the plan is feasible.
    return "Yes";
}
