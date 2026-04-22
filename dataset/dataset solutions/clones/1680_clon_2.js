function ProcessInput(rawData) {
 // This function orchestrates the entire process, taking raw input data.
    const lines = rawData. split ("\n") ; // Divide the input string into an array of lines.

    // Extract the iteration count from the first line, ensuring it's an integer.
    const limitCount = Number.parseInt (lines[0], 10) ;

    // Obtain the binary string from the second line of input.
    const binaryString = lines[1];

    // Loop through each position of the binary string up to the specified limit.
    for (let currentIdx = 0; currentIdx < limitCount; currentIdx++) {
        // Create a temporary binary string by flipping the bit at the 'currentIdx' position.
        const alteredBinaryString =
            binaryString.slice(0, currentIdx) + // Part of the string before the current index.
            (binaryString[currentIdx] === "1" ? "0" : "1") + // The flipped bit.
            binaryString.slice(currentIdx + 1); // Part of the string after the current index.

        // Convert the altered binary string to a decimal integer (base 2)
        // and then pass it to the recursive calculation function.
        // The result of this calculation is then printed to the console.
        console.log(computeRecursiveValue(Number.parseInt(alteredBinaryString, 2)));
    }
}

// Invoke the main processing function with data read from standard input.
// This reads the entire content of '/dev/stdin' as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// This helper function computes a value that resembles a "population count"
// but actually counts the number of digits in the decimal representation
// of the binary string form of the input number.
function deriveDigitCount(inputNum) {
    // First, convert the input number to its binary string representation.
    // Then, parse this binary string as if it were a decimal number (e.g., "101" becomes 101).
    // Convert this new decimal number back into a string.
    // Split this string into an array of individual characters (digits).
    // Filter out any falsy values (which shouldn't occur for digits '0'-'9').
    // Finally, return the total count of these characters.
    return (
        Number.parseInt(inputNum.toString(2))
            .toString()
            .split("")
            .filter((charSegment) => charSegment)
            .length
    );
}

// A recursive function that calculates a value based on modulo operations
// using the result of 'deriveDigitCount'.
function computeRecursiveValue(currentValue, iterationCount) {
    // Base case for the recursion: if 'currentValue' becomes zero,
    // return the accumulated 'iterationCount' or 0 if it's the first call.
    if (currentValue === 0) {
        return iterationCount || 0;
    }

    // Recursive step:
    // The next 'currentValue' is determined by taking the current 'currentValue'
    // modulo the result of 'deriveDigitCount' applied to the 'currentValue'.
    // The 'iterationCount' is incremented for each recursive call,
    // or initialized to 1 if it's the very first step of the recursion.
    return computeRecursiveValue(
        currentValue % deriveDigitCount(currentValue),
        iterationCount ? iterationCount + 1 : 1
    );
}