function ProcessInput(rawData) {
    // This function takes raw input data as a string and processes it
    // to calculate a specific sum based on array elements and a multiplier.

    // Split the entire input string into an array of individual lines.
    const parsedLines = rawData.split("\n");

    // The first line contains two space-separated integers: N and K.
    const firstLineParts = parsedLines[0].split(" ");
    // Parse the first integer as the length of the array.
    const arrayLength = parseInt(firstLineParts[0], 10);
    // Parse the second integer as the multiplier.
    const multiplier = parseInt(firstLineParts[1], 10);

    // The second line contains space-separated integers that form the main numeric array.
    // Convert these string representations into actual numbers.
    const numericArray = parsedLines[1].split(" ").map(currentValue => parseInt(currentValue, 10));

    // Initialize a variable to accumulate the final calculated sum.
    let totalSum = 0;

    // Define a constant for the modulo operation, commonly used in competitive programming.
    const MODULO_PRIME = 1000000007; // A large prime number

    // Iterate through each element of the numeric array from the beginning to the end.
    for (let idx = 0; idx < arrayLength; idx++) {
        // Calculate 'smallerCountSuffix':
        // This counts how many elements *after* the current element (numericArray[idx])
        // are strictly smaller than numericArray[idx].
        const smallerCountSuffix = numericArray.slice(idx + 1).filter(currentValue => currentValue < numericArray[idx]).length;

        // Calculate 'smallerCountTotal':
        // This counts how many elements in the *entire* numericArray
        // are strictly smaller than the current element (numericArray[idx]).
        const smallerCountTotal = numericArray.filter(currentValue => currentValue < numericArray[idx]).length;

        // Add the first component to the total sum: (smallerCountSuffix * multiplier).
        totalSum += (smallerCountSuffix * multiplier);
        // Apply the modulo operation to prevent integer overflow and keep the sum within bounds.
        totalSum %= MODULO_PRIME;

        // Add the second component to the total sum:
        // (smallerCountTotal * (multiplier - 1) * multiplier / 2).
        // The term (multiplier - 1) * multiplier / 2 represents the sum of integers from 1 to (multiplier - 1),
        // or the number of pairs from 'multiplier' items.
        // This calculation is done before applying modulo to the entire term.
        totalSum += (smallerCountTotal * (multiplier - 1) * multiplier / 2) % MODULO_PRIME;
        // Apply the modulo operation again to the total sum after adding the second component.
        totalSum %= MODULO_PRIME;
    }

    // Print the final calculated total sum to the standard output.
    console.log(totalSum);
}

// Read the entire content of the standard input file synchronously,
// using UTF-8 encoding, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
