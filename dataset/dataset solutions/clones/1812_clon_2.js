const processInput = rawData => {
    // This section handles the initial parsing of the input string.
    const parsedLines = rawData.trim().split("\n");

    // The first line typically contains the count of elements, though it's not directly used in this calculation.
    const countElements = parseInt(parsedLines[0]);

    // The second line contains space-separated numbers, which are converted to BigInts for large number arithmetic.
    const numberList = parsedLines[1].split(" ").map(elementString => BigInt(elementString));

    // A quick check: if the list contains zero, the product will always be zero.
    if (numberList.includes(0n)) {
        console.log(0); // Output the result.
        return; // Terminate execution early.
    }

    // Initialize a variable to store the cumulative product, starting with BigInt one.
    let productResult = 1n;

    // Iterate through each numerical value in the processed list.
    for (let currentNumber of numberList) {
        // Multiply the current product by the number from the list.
        productResult = productResult * currentNumber;

        // Check for an overflow condition against a predefined large number (10^18).
        if (productResult > BigInt(1000000000000000000)) {
            console.log(-1); // Indicate an overflow by printing -1.
            return; // Exit the function.
        }
    }

    // If no zero was found and no overflow occurred, print the final product as a string.
    console.log(productResult.toString());
};

// The program starts by reading input from standard input using Node.js file system module.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
