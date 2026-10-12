function ProcessInput(rawData) {
    // The input string is first split by newline characters to separate lines.
    rawData = rawData.split("\n");

    // The second line of the input (index 1) is taken, split by spaces,
    // and each resulting string is converted into a BigInt.
    let numberArray = rawData[1].split(" ").map(BigInt);

    // Initialize a BigInt variable to accumulate the sum of all numbers in the array.
    let totalSum = BigInt(0);
    // Iterate through the 'numberArray' to calculate its initial total sum.
    numberArray.forEach(currentVal => totalSum += currentVal);

    // Initialize another BigInt variable to store the final computed result.
    let resultAccumulator = BigInt(0);

    // Loop through each individual element in the 'numberArray'.
    for (const element of numberArray) {
        // Subtract the current 'element' from 'totalSum'.
        // This effectively gives the sum of all elements that appear *after* the current one
        // in the original sequence, as 'totalSum' initially held the sum of all elements.
        totalSum -= element;
        // Add to 'resultAccumulator' the product of the current 'element' and the
        // 'totalSum' (which now represents the sum of subsequent elements).
        resultAccumulator += element * totalSum;
    }

    // The final result is obtained by taking the modulo of 'resultAccumulator' with
    // 1000000007 (represented as a BigInt) and then converting it back to a standard Number
    // for output.
    console.log(Number(resultAccumulator % BigInt(1000000007)));
}

// Read the entire content from standard input as a UTF-8 string,
// and then pass it to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
