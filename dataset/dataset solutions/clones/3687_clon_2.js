let inputReader = initializeInput();

executeProgram();

// This function retrieves and parses an integer from the input.
function readInteger()
{
    return dataTransformer(getNextLine(), 1);
}

// This function obtains a line from input and splits it into string tokens.
function readStringArray()
{
    return dataTransformer(getNextLine(), 2); // Divides string by space characters
}

// This function fetches a line, splits it by spaces, and converts parts to numbers.
function readIntegerArray()
{
    return dataTransformer(getNextLine(), 4); // Splits by space, then casts to number
}

// This function reads a line and breaks it down into an array of individual characters.
function readCharacterArray()
{
    return dataTransformer(getNextLine(), 6); // Separates into distinct characters
}

// Fetches the subsequent line from the input source.
function getNextLine()
{
    return inputReader.getNextLine();
}

// Determines if there are additional lines available in the input.
function hasMoreLines()
{
    return inputReader.hasMoreLines();
}

// Reads and prepares the standard input content.
function getInputContent()
{
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Initializes the object responsible for managing input stream access.
function initializeInput()
{
    const rawInputData = getInputContent();
    let inputHandler = {
        lineList: rawInputData,
        currentLineIndex: 0,
        totalLines: rawInputData.length,

        hasMoreLines: function()
        {
            return ( this.currentLineIndex < this.totalLines );
        },

        getNextLine: function()
        {
            if ( !this.hasMoreLines() )
            {
                return ""; // Returns an empty string if no further input is present.
            }
            else
            {
                let retrievedLine = this.lineList[this.currentLineIndex];
                this.currentLineIndex++;
                return retrievedLine;
            }
        }
    };
    return inputHandler;
}

// Outputs the provided value to the standard console stream.
function printResult(displayValue)
{
    console.log(displayValue);
}

// Logs an error message to the standard error output stream.
function logError(errorMessage)
{
    console.error(errorMessage);
}

// This comprehensive utility function handles various data format conversions.
// `inputVal`: The data input requiring transformation.
// `transformMode`: An integer flag specifying the type of conversion.
//  - Mode 1: Convert to a base-10 integer.
//  - Mode 2: Split a string by space.
//  - Mode 4: Split by space, then convert each piece to a number.
//  - Mode 6: Split a string into an array of its constituent characters.
//  - Mode 7: Split into characters, then convert each character to a number.
//  - Mode 8: Join array elements with a single space.
//  - Mode 9: Join array elements, separating each with a newline character.
//  - Mode 0: Concatenate array elements without any separator.
//  - Other: Return the input value without modification.
function dataTransformer(inputVal, transformMode)
{
    try
    {
        switch (transformMode)
        {
            case 1:
                return parseInt(inputVal);
            case 2:
                return inputVal.split(" ");
            case 4:
                return inputVal.split(" ").map((elementStr) => Number(elementStr));
            case 6:
                return inputVal.split("");
            case 7:
                return inputVal.split("").map((elementStr) => Number(elementStr));
            case 8:
                return inputVal.join(" ");
            case 9:
                return inputVal.join("\n");
            case 0:
                return inputVal.join("");
            default:
                return inputVal;
        }
    }
    catch (errorOccurred)
    {
        return inputVal; // If an error occurs during transformation, return the original input.
    }
}

// This function encapsulates the primary operational logic of the program.
function executeProgram()
{
    const firstLineValues = readIntegerArray();
    const dimensionSize = firstLineValues[0];
    const limitValue = firstLineValues[1]; // This variable is defined but not utilized in the algorithm.
    const differenceThreshold = firstLineValues[2];

    let occurrenceMap = {}; // An object to tally the frequency of various match counts.

    // Iterating through all possible permutations of four indices within the given dimension.
    for ( let idxA = 1; idxA <= dimensionSize; idxA++ )
    {
        for ( let idxB = 1; idxB <= dimensionSize; idxB++ )
        {
            for ( let idxC = 1; idxC <= dimensionSize; idxC++ )
            {
                for ( let idxD = 1; idxD <= dimensionSize; idxD++ )
                {
                    let matchCount = 0; // Accumulator for conditions met in the current loop iteration.

                    // Evaluate conditions based on absolute differences and the threshold.
                    if ( Math.abs( idxA - idxB ) === differenceThreshold )
                    {
                        matchCount++;
                    }
                    if ( Math.abs( idxC - idxB ) === differenceThreshold )
                    {
                        matchCount++;
                    }
                    if ( Math.abs( idxC - idxD ) === differenceThreshold )
                    {
                        matchCount++;
                    }

                    // Increment the counter in the map for the calculated matchCount.
                    if ( occurrenceMap[matchCount] === undefined ) // Using 'undefined' for explicit existence check.
                    {
                        occurrenceMap[matchCount] = 1;
                    }
                    else
                    {
                        occurrenceMap[matchCount]++;
                    }
                }
            }
        }
    }

    printResult(occurrenceMap); // Display the final aggregated counts.
}