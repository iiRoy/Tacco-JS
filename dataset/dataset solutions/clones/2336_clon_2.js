// This function processes the main data stream received as input
function ProcessData( rawData )
{
    // Convert the raw input string into an integer base-10 value
    let currentNumericalValue = Number.parseInt(rawData, 10);

    // Initialize an accumulator variable to store the cumulative sum
    let totalAccumulation = 0;

    // Loop through the values, decrementing by two each time, until zero is reached
    while (currentNumericalValue > 0)
    {
        // Add the count of any trailing zero digits found in the current number
        totalAccumulation += getTrailingZeroCount(currentNumericalValue);

        // Subtract two from the current numerical value for the next iteration
        currentNumericalValue -= 2;
    }

    // Print the final calculated total to the console output
    console.log(totalAccumulation);
}


// This helper function determines how many '0' digits appear at the end of a number
function getTrailingZeroCount( numericValue )
{
    // A flag to control the loop's continuation
    let shouldContinue = true;

    // Convert the incoming numeric value into its string representation
    let valueAsString = String(numericValue);

    // Determine the index of the very last character in the string
    let currentCharacterIndex = valueAsString.length - 1;

    // Initialize a counter for the number of trailing zeroes identified
    let detectedZeroes = 0;

    // Iterate backwards from the end of the string while the continuation flag is true
    while (shouldContinue)
    {
        // Check if the character at the current index is indeed a '0'
        if (valueAsString[currentCharacterIndex] === "0")
        {
            // Move to the character immediately preceding the current one
            currentCharacterIndex--;
            // Increment the counter for the zeroes found
            detectedZeroes++;
        }
        else
        {
            // If the character is not '0', then we have reached the end of the trailing zeroes
            shouldContinue = false;
        }
    }

    // Return the final count of trailing zero digits
    return detectedZeroes;
}

// The program's entry point: reads content from standard input and starts processing
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));