/*
 * This file provides utilities for reading input from stdin
 * and then solves a specific coordinate transformation problem.
 */

// Define a class to handle input string parsing.
function InputReader(inputString)
{
    // Store the input string split into an array of lines.
    this._sourceLines = inputString.split("\n") ;
    // Initialize the current line index to the beginning.
    this._currentLineIndex = 0;
};

// Attach methods to the InputReader prototype for efficient input handling.
InputReader.prototype =
{
    /**
     * Reads a single element from the current line.
     * Elements on a line are split by spaces and read from right to left.
     *
     * @param {boolean} asString - If true, returns the element as a string; otherwise, converts to a number.
     * @returns {string|number} The read element.
     */
    readElement: function(asString)
    {
        var linesArray = this._sourceLines,       // Reference to all input lines.
            currentIndex = this._currentLineIndex, // Current line number.
            resultElement;                          // Variable to hold the extracted element.

        // Check if the current line has not yet been processed into an array of elements.
        if (typeof linesArray[currentIndex] === "string")
        {
            // Split the current line by spaces and reverse it to read from the right.
            linesArray[currentIndex] = linesArray[currentIndex].split(" ").reverse();
        }

        // Pop the last element (which is the first element when reversed).
        resultElement = linesArray[currentIndex].pop();

        // If the current line is now empty, advance to the next line.
        if (!linesArray[currentIndex].length)
        {
            this._currentLineIndex++;
        }

        // Return the element, converting to a number if 'asString' is false.
        return asString ? resultElement : +resultElement;
    },


    /**
     * Reads all elements from the current line.
     * Advances the line index after reading.
     *
     * @param {boolean} keepStrings - If true, returns elements as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of elements from the line.
     */
    readLineElements: function(keepStrings)
    {
        // Get the current line, split it by spaces, and then advance the line index.
        var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");

        // Return elements, converting to numbers if 'keepStrings' is false.
        return keepStrings ? lineParts : lineParts.map(val => +val);
    },


    /**
     * Reads multiple lines, processing each line into an array of elements.
     *
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} preserveTypes - If true, elements are kept as strings; otherwise, converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the read lines.
     */
    readMultipleLines: function(numLines, preserveTypes)
    {
        var dataLines = this._sourceLines,      // Reference to the source lines.
            lineCursor = this._currentLineIndex,  // Starting index for reading multiple lines.
            outputMatrix = [],                    // Array to store the processed lines.
            lineCounter = 0;                      // Loop counter for lines.

        // Process lines based on whether types should be preserved or converted to numbers.
        if (preserveTypes)
        {
            // If preserving types, split each line by space.
            for (; lineCounter < numLines; lineCounter++)
            {
                outputMatrix[lineCounter] = dataLines[lineCursor + lineCounter].split(" ");
            }
        }
        else
        {
            // If converting to numbers, split and then map to numbers.
            for (; lineCounter < numLines; lineCounter++)
            {
                outputMatrix[lineCounter] = dataLines[lineCursor + lineCounter].split(" ").map(item => +item);
            }
        }

        // Advance the global line index by the number of lines read.
        this._currentLineIndex += numLines;

        return outputMatrix;
    },
};

// Create an instance of the InputReader to process input from standard in.
var inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the coordinate transformation solution.
console.log(coordinateSolver());

/**
 * Main function to solve the coordinate transformation problem.
 * Reads coordinates, performs parity checks, and generates movement instructions.
 *
 * @returns {string} The formatted result string containing number of steps, weights, and movements.
 */
function coordinateSolver()
{
    // Read the total number of coordinate pairs.
    var numCoordinates = inputProcessor.readElement();
    // Read all coordinate pairs into a 2D array.
    var coordinatePairs = inputProcessor.readMultipleLines(numCoordinates);

    // Calculate the parity (even/odd sum) of the first coordinate pair.
    // This parity will be used as a reference for all other pairs.
    var parityCheck = (coordinatePairs[0][0] + coordinatePairs[0][1]) & 1;

    // Iterate through the remaining coordinate pairs to ensure consistent parity.
    for (var coordIndex = 1; coordIndex < numCoordinates; coordIndex++)
    {
        // Calculate the parity of the current coordinate pair.
        var currentParity = (coordinatePairs[coordIndex][0] + coordinatePairs[coordIndex][1]) & 1;
        // If any coordinate pair has a different parity, the problem is unsolvable.
        if (currentParity !== parityCheck)
        {
            return -1; // Indicate impossibility.
        }
    }

    // Determine the number of steps (weights) needed for decomposition.
    // If initial parity is 0 (even), we need 32 steps. If 1 (odd), 31 steps.
    var numSteps = 32 - parityCheck;

    // Initialize an array for decomposition weights.
    // The first weight is 2^30 (1 << 30).
    var decompositionWeights = [1 << 30];

    // Populate the rest of the decomposition weights by repeatedly halving the previous weight.
    for (coordIndex = 1; coordIndex < 31; coordIndex++)
    {
        decompositionWeights[coordIndex] = decompositionWeights[coordIndex - 1] >> 1;
    }

    // Special case: If the number of steps is even, ensure the last weight is 1.
    // This happens when parityCheck is 0, meaning numSteps is 32.
    // The original loop only goes up to 30, so d[31] would be undefined.
    // This implicitly handles the case where numSteps is 32 (parityCheck is 0),
    // and effectively adds 1 to the end of the decompositionWeights array.
    if (numSteps % 2 === 0)
    {
        decompositionWeights[31] = 1;
    }

    // Initialize an array to store movement instruction strings for each coordinate.
    var movementStrings = [];

    // Iterate through each coordinate pair to generate movement instructions.
    for (coordIndex = 0; coordIndex < numCoordinates; coordIndex++)
    {
        // Initialize an empty string for the current coordinate's movements.
        movementStrings[coordIndex] = "";

        // Apply each decomposition weight to adjust the coordinate.
        for (var weightIndex = 0; weightIndex < numSteps; weightIndex++)
        {
            // Store current coordinate components and weight for readability.
            var currentX = coordinatePairs[coordIndex][0];
            var currentY = coordinatePairs[coordIndex][1];
            var currentWeight = decompositionWeights[weightIndex];

            // Decide whether to move along X or Y axis based on absolute values.
            if (Math.abs(currentX) > Math.abs(currentY))
            {
                // Move along X axis.
                if (currentX > 0)
                {
                    coordinatePairs[coordIndex][0] -= currentWeight; // Decrease X
                    movementStrings[coordIndex] += "R";             // Move Right
                }
                else
                {
                    coordinatePairs[coordIndex][0] += currentWeight; // Increase X
                    movementStrings[coordIndex] += "L";             // Move Left
                }
            }
            else
            {
                // Move along Y axis.
                if (currentY > 0)
                {
                    coordinatePairs[coordIndex][1] -= currentWeight; // Decrease Y
                    movementStrings[coordIndex] += "U";             // Move Up
                }
                else
                {
                    coordinatePairs[coordIndex][1] += currentWeight; // Increase Y
                    movementStrings[coordIndex] += "D";             // Move Down
                }
            }
        }
    }

    // Format and return the final result:
    // 1. Number of steps.
    // 2. Space-separated decomposition weights.
    // 3. Newline-separated movement strings for each coordinate.
    return numSteps + "\n" + decompositionWeights.join(" ") + "\n" + movementStrings.join("\n");
}