function ProcessData(rawInputString) {
    // This function takes the raw input string, processes it, and performs a specific calculation.

    // First, divide the complete input into individual lines.
    let processedLines = rawInputString.split("\n");

    // Extract the second line (at index 1) and convert its space-separated elements
    // into an array of BigInt numbers.
    const numericValues = processedLines[1] . split(" ") . map(BigInt);

    // Initialize a BigInt variable to keep track of the cumulative sum of all numbers.
    let totalSum = BigInt(0);

    // Iterate over each number in the array to compute the initial total sum.
    numericValues . forEach(itemValue => totalSum += itemValue);

    // Initialize an accumulator for the final computed result, also as a BigInt.
    let finalAccumulator = BigInt(0);

    // Now, iterate through each element in the array to perform the main calculation.
    for (
        const currentElement of numericValues
    )
    {
        // Subtract the current element from the total sum to get the sum of remaining elements.
        totalSum -= currentElement;

        // Multiply the current element by the sum of remaining elements and add it to the accumulator.
        finalAccumulator += currentElement * totalSum;
    }

    // Log the final result: convert the BigInt accumulator to a Number after applying
    // a modulo operation with a large prime number (1000000007).
    console.log(
        Number(
            finalAccumulator % BigInt(1000000007n)
        )
    );
}

// Invoke the primary data processing function.
// It reads content from standard input synchronously using Node.js 'fs' module.
ProcessData(
    require("fs").readFileSync("/dev/stdin", "utf8")
);