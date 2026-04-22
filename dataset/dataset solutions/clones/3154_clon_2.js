function ProcessData(rawData) {
    // Parse the incoming raw string data into an array of numeric values.
    // The string is expected to contain space-separated numbers.
    let parsedNumbers = rawData.split(" ").map(Number);


    // Initialize an array to store the common divisors found.
    const commonDivisors = [];

    // Iterate through numbers starting from 1 up to (but not including)
    // the minimum of the first two parsed numbers minus one.
    // This loop identifies potential common divisors.
    for (let divisorCandidate = 1; divisorCandidate < Math.min(parsedNumbers[0], parsedNumbers[1]) - 1; divisorCandidate++) {
        // Check if the current candidate divides both the first and second
        // parsed numbers without any remainder.
        if ((parsedNumbers[0] % divisorCandidate === 0) && (parsedNumbers[1] % divisorCandidate === 0)) {
            // If it's a common divisor, add it to our collection.
            commonDivisors.push(divisorCandidate);
        }
    }

    // Output a specific element from the collection of common divisors.
    // The index is determined by subtracting the third parsed number
    // from the total count of found common divisors.
    console.log(commonDivisors[commonDivisors.length - parsedNumbers[2]]);
}

// Read input from standard input using Node.js file system module
// and then invoke the main processing function.
ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));