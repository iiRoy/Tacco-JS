/*
 * This JavaScript code processes input data to calculate mountain values
 * based on an initial set of valley values.
 *
 * It demonstrates basic array manipulation, parsing, and arithmetic operations
 * within a functional structure.
 *
 * The 'input' parameter is expected to contain the raw data from standard input.
 */
function Main(input)
{
    // The input string is split into an array of lines.
    // Each line then becomes an element in the 'input' array.
    input = input.split("\n");


    // The second line of input (index 1) contains space-separated values.
    // These are temporarily stored in 'tmp' for further processing.
    tmp = input[1] . split(" ");

    /*
     * The first line of input (index 0) is parsed as an integer.
     * The radix 10 is specified for base-10 conversion.
     * This value 'N' might represent the count of elements, though it's not
     * directly used in the subsequent calculations in this specific implementation.
     */
    var N = parseInt(input[0], 10);

    // Converts all string elements in 'tmp' to integers and stores them in 'valley'.
    var valley = toIntAll(tmp);

    // Initializes a variable to accumulate the sum of all 'valley' elements.
    var sumValley = 0;

    // Loop through each element of the 'valley' array to calculate its total sum.
    for (
        var i = 0;
        i < valley.length;
        i++
    )
    {
        sumValley += valley[i];
    }


    var tmpSum = 0; // Temporary sum for alternating valley elements.


    // This loop sums up elements at odd indices (1, 3, 5, ...) of the 'valley' array.
    for (var i = 1; i < valley.length; i += 2)
    {
        tmpSum += valley[i];
    }


    /*
     * Calculates the initial mountain value (at index 0)
     * based on the total sum of valley elements and the sum of alternating elements.
     * The formula involves subtracting twice the 'tmpSum' from 'sumValley'.
     */
    tmpMountainZero = sumValley - (2 * tmpSum);

    // Declares an array to store the calculated mountain values.
    var tmpMountain = [];

    // Assigns the first calculated mountain value to the first index of 'tmpMountain'.
    tmpMountain[0] = tmpMountainZero;

    // Iterates from the second element to calculate subsequent mountain values.
    // Each mountain value depends on the previous valley and mountain values.
    for (var i = 1; i < valley.length; i++)
    {
        tmpMountain[i] = (valley[i - 1] - (tmpMountain[i - 1] / 2)) * 2;
    }

    // Outputting the final result.
    // The 'tmpMountain' array elements are joined by spaces and printed to the console.
    console.log('%s', outputDelimiterSpace(tmpMountain));
}

/**
 * Helper function to convert an array of strings to an array of integers.
 * @param {Array<string>} input - An array of strings, each representing a number.
 * @returns {Array<number>} An array of integers.
 */
function toIntAll(input)
{
    var out = []; // Initialize an empty array for integer output.

    // Loop through each string in the input array.
    for (var i = 0; i < input.length; i++)
    {
        // Parse each string to an integer and store it in the 'out' array.
        out[i] = parseInt(input[i]);
    }
    return out; // Return the array of integers.
}

/*
 * Helper function to format an array of words (numbers) into a space-delimited string,
 * followed by a newline character.
 * This is typically used for standard output formatting.
 */
function outputDelimiterSpace(words)
{
    var out = words.join(' '); // Join array elements with a single space.
    out += '\n'; // Append a newline character to the end of the string.
    return out; // Return the formatted string.
}

/*
 * !!! DO NOT EDIT BELOW THIS LINE !!!
 * This section handles standard input/output operations.
 * It reads the entire content from /dev/stdin (standard input)
 * and then calls the 'Main' function with the read data.
 */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));