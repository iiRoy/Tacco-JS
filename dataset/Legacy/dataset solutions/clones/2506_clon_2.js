function ProcessInput(inputData) {
    // This function processes the given input string to calculate specific values.

    // Extract the first line, convert it to a number, and store it as the total count.
    let countElements = inputData.split("\n")[0] - 0;

    // Extract the second line, split it by spaces, and map each part to a number.
    const dataArray = inputData.split("\n")[1].split(" ").map(val => val - 0);

    // Create a Set from the data array to easily get unique values.
    var uniqueValues = new Set(dataArray);
    // Initialize an array to store the computed results for output.
    let resultList = [];

    // The first element in our result list is simply the total count.
    resultList.push(countElements);

    // Loop through possible divisors, starting from 2 up to the total count.
    for (let divisor = 2; divisor <= countElements; divisor++) {
        // Check if the number of unique elements is less than the current divisor.
        if (uniqueValues.size < divisor) {
            // If it is, add a zero to the result list.
            resultList.push(0);
        }
        else {
            // Otherwise, calculate the floor division of unique elements by the divisor and add it.
            resultList.push(Math.floor(uniqueValues.size / divisor));
        }
    }

    // Join all elements in the result list with newline characters and print to console.
    console.log(resultList.join("\n").toString());

    // The function concludes.
    return;
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
