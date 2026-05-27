function ProcessInputData(rawText) {
    // This function processes the incoming text data.
    let numberArray = rawText.split(" ").map(function(itemStr) {
        // Convert each string part into an integer.
        return parseInt(itemStr, 10);
    });

    // Calculate the product of the first two numbers and twice their sum.
    let productResult = numberArray[0] * numberArray[1];
    let sumDoubledResult = (numberArray[0] + numberArray[1]) * 2;

    // Output the results formatted as a string.
    console.log(productResult + " " + sumDoubledResult);
}

// Read data from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
