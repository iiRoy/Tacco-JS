// This function processes an input string to find a specific pattern.
function CalculateResult(sourceContent)
{

    // Extract the sequence length from the first line of the input.
    // The input is expected to have the length on the first line and the sequence on the second.
    var sequenceLength = Number(sourceContent.split("\n")[0]);

    // Obtain the character sequence from the second line of the input.
    var characterSequence = sourceContent.split("\n")[1];

    // Initialize a 2D dynamic programming matrix (table) with dimensions based on sequenceLength.
    var dynamicMatrix = new Array(sequenceLength);

    // Populate the dynamic programming matrix with inner arrays and set initial boundary values.
    for (var rowIndex = 0; rowIndex < sequenceLength; rowIndex++) {

        dynamicMatrix[rowIndex] = new Array(sequenceLength + 1); // Create a new row for the matrix.
        dynamicMatrix[rowIndex][sequenceLength] = 0;             // Set the rightmost boundary to zero.
    }

    // Process the last row of the matrix or a specific segment, working backwards.
    for (var columnIndex = sequenceLength - 1; columnIndex >= 0; columnIndex--)
    {
        // If we are at the very last column, set its value to zero and skip further checks.
        if (columnIndex === sequenceLength - 1)
        {
            dynamicMatrix[sequenceLength - 1][columnIndex] = 0;
            continue;
        }

        // Compare characters at specific positions within the sequence.
        if (characterSequence[sequenceLength - 1] === characterSequence[columnIndex])
        {
            dynamicMatrix[sequenceLength - 1][columnIndex] = 1; // Mark as a match.
        }
        else
        {
            dynamicMatrix[sequenceLength - 1][columnIndex] = 0; // Mark as no match.
        }
    }


    // Iterate through the dynamic matrix from bottom-right towards top-left to fill values.
    // This part performs the core dynamic programming calculation.
    for (var rowIndex = sequenceLength - 2; rowIndex >= 0; rowIndex--)
    {
        for (var columnIndex = sequenceLength - 1; columnIndex >= 0; columnIndex--)
        {
            // If row and column indices are identical, it's a diagonal element; set to zero.
            if (rowIndex === columnIndex)
            {
                dynamicMatrix[rowIndex][columnIndex] = 0;
                continue;
            }

            // Check for character equality at the current indices.
            if (characterSequence[rowIndex] === characterSequence[columnIndex])
            {
                // If characters match, increment the value from the diagonally down-right cell.
                dynamicMatrix[rowIndex][columnIndex] = dynamicMatrix[rowIndex + 1][columnIndex + 1] + 1;
            }
            else
            {
                // If characters do not match, reset the count to zero.
                dynamicMatrix[rowIndex][columnIndex] = 0;
            }
        }
    }

    // Flatten the 2D dynamic matrix into a single, one-dimensional collection for easier processing.
    var linearCollection = Array.prototype.concat.apply([], dynamicMatrix);

    // Find the maximum value within the flattened collection.
    var ultimateMax = Math.max.apply(null, linearCollection);

    // Output the computed maximum value to the console.
    console.log(ultimateMax);
}

// Invoke the main calculation function, reading input from standard input.
CalculateResult( require("fs").readFileSync("/dev/stdin", "utf8") );