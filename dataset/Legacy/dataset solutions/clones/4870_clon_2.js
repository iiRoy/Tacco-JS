// This function processes the provided text data.
function ProcessInput(rawData) {
    // Split the raw input string by spaces to get individual string numbers.
    rawData = rawData.split(" ");

    // Convert each string number to an integer and store them in an array.
    const numericValues = rawData.map(strNum => parseInt(strNum, 10));

    // Sort the array of numbers in ascending order.
    numericValues.sort((valA, valB) => valA - valB);

    // Check if the sum of the two smallest numbers equals the largest number.
    // Then print "Yes" or "No" accordingly.
    console.log(numericValues[0] + numericValues[1] === numericValues[2] ? "Yes" : "No");
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
