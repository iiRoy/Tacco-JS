function ProcessInput(rawData) {
    // Split the entire raw input string into an array of individual lines.
    let lineData = rawData.split("\n");

    // The first line contains two space-separated integers: N and K.
    const firstLineTokens = lineData[0].split(" ");
    // Parse the first token as the size of the array.
    const arraySize = parseInt(firstLineTokens[0]); // Corresponds to N in the original.
    // Parse the second token as the repetition factor.
    const repeatFactor = parseInt(firstLineTokens[1]); // Corresponds to K in the original.

    // The second line contains space-separated numbers, which are parsed into an array of integers.
    const numericArray = lineData[1].split(" ").map(val => parseInt(val)); // Corresponds to As in the original.

    // Initialize a variable to accumulate the total count of inversions.
    let inversionSum = 0; // Corresponds to count in the original.

    // Iterate through each element of the numeric array from the first to the last.
    for (let idx = 0; idx < arraySize; idx++) { // Corresponds to i in the original.
        // Calculate 'subsequentSmaller': the number of elements *after* the current element
        // that are strictly less than the current element.
        let subsequentSmaller = numericArray.slice(idx + 1).filter(val => val < numericArray[idx]).length; // Corresponds to u in the original.

        // Calculate 'overallSmaller': the number of elements in the *entire* array
        // that are strictly less than the current element.
        let overallSmaller = numericArray.filter(val => val < numericArray[idx]).length; // Corresponds to v in the original.

        // Add to the total inversion sum. This part accounts for inversions within the 'repeatFactor' blocks
        // where the first element is from an earlier block and the second from a later block.
        inversionSum += subsequentSmaller * repeatFactor;

        // Add to the total inversion sum. This part accounts for inversions where both elements
        // are from different 'repeatFactor' blocks, but not necessarily in order.
        // The formula (repeatFactor - 1) * repeatFactor / 2 represents the sum of integers from 1 to (repeatFactor - 1),
        // which is the number of pairs of distinct blocks.
        inversionSum += Math.floor(overallSmaller * (repeatFactor - 1) * repeatFactor / 2);
    }

    // Define the modulus value for the final result.
    const MODULO_VALUE = Math.pow(10, 9) + 7;

    // Output the final accumulated inversion sum, taken modulo the specified value.
    console.log(inversionSum % MODULO_VALUE);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
