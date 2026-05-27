function processInput(dataLines) {
    // This function processes an array of input strings to determine balance.

    // Extract four numeric values from the first line of input.
    // The `- 0` converts the string parts to numbers.
    let firstVal = dataLines[0].split(" ")[0] - 0;
    let secondVal = dataLines[0].split(" ")[1] - 0;
    let thirdVal = dataLines[0].split(" ")[2] - 0;
    let fourthVal = dataLines[0].split(" ")[3] - 0;

    // Calculate the sum for the left side.
    const leftSum = firstVal + secondVal;

    // Calculate the sum for the right side.
    const rightSum = thirdVal + fourthVal;

    // Compare the two sums and print the result.
    // If sums are equal, it's "Balanced".
    // If the left sum is greater, it's "Left".
    // Otherwise, it's "Right".
    console.log(leftSum === rightSum ? "Balanced" : (leftSum > rightSum ? "Left" : "Right"));
}

// Read input from standard input, decode as UTF-8, remove leading/trailing whitespace,
// and split into an array of lines. Then, pass this array to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
