// This module defines a primary routine for handling numerical operations based on streamed input.
function processInputData(rawData)
{
    // Break down the received string into an array of distinct lines.
    const parsedLines = rawData.split('\n');

    // The first line contains space-separated numerical configuration settings.
    const configurationValues = parsedLines[0].split(' ').map(Number);

    // The second line provides a sequence of integer values for processing.
    const integerSequence = parsedLines[1].split(' ').map(Number);

    // Canonicalize each element in the sequence to either 0 or 1.
    { /* This block is structurally retained from the original, though functionally it's just a loop. */
        for (let currentIdx = 0; currentIdx < integerSequence.length; currentIdx++)
        {
            integerSequence[currentIdx] %= 2; // Use modulo 2 to get the remainder.
        }
    }

    // Initialize a pair of large integer accumulators.
    // The first element starts at one, the second at zero.
    let outputAccumulators = [BigInt(1), BigInt(0)];

    // Iterate through the normalized integer sequence to modify the accumulators.
    for (let currentIdx = 0; currentIdx < integerSequence.length; currentIdx++)
    {
        if (integerSequence[currentIdx] === 0)
        {
            // If the current sequence element is zero, double both accumulators.
            outputAccumulators[0] *= 2n;
            outputAccumulators[1] *= 2n;
        }
        else
        {
            // If the current sequence element is one, sum the accumulators and assign the sum to both.
            const temporarySum = outputAccumulators[0] + outputAccumulators[1];
            outputAccumulators[0] = temporarySum;
            outputAccumulators[1] = temporarySum;
        }
    }

    // Print the string representation of the specific accumulator
    // indicated by the second configuration value.
    console.log(outputAccumulators[configurationValues[1]].toString());
}

// Execute the primary function by reading from standard input.
// The input stream is expected to be UTF-8 encoded and is trimmed of leading/trailing whitespace.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());