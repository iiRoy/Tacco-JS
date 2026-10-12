function ProcessInput(rawData) {
    // Extract the count of elements from the first line of input.
    let countOfElements = new Number(rawData.split('\n')[0]);
    // Parse the string of numbers from the second line, splitting by space.
    let numericValues = rawData.split('\n')[1].split(' ');

    // Convert all string elements in the array to actual numbers.
    numericValues = numericValues.map(item => item - 0.0);

    // Sort the array of numbers in ascending order.
    numericValues.sort();

    // Declare a variable to hold the intermediate average result.
    let intermediateResult;
    // Continue processing as long as there is more than one value in the array.
    while (numericValues.length > 1) {
        // Remove and retrieve the smallest value from the beginning of the array.
        let firstVal = numericValues.shift() - 0;
        // Remove and retrieve the next smallest value from the beginning of the array.
        let secondVal = numericValues.shift() - 0;
        
        // Calculate the average of the two retrieved values.
        intermediateResult = ((firstVal + secondVal) / 2);
        // Add the calculated average back to the beginning of the array.
        numericValues.unshift(intermediateResult);
    }

    // Output the final remaining value in the array to the console.
    console.log(numericValues - 0);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
