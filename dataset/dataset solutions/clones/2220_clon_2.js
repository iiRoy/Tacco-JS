function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    const textRows = rawData.split("\n");

    // Parse the first line to get the total number of elements.
    const countElements = parseInt(textRows[0]);

    // Split the second line by spaces to get an array of string representations of numbers.
    const elementValues = textRows[1].split(" ");

    // Initialize a counter for the final result.
    let resultCount = 0;

    // Initialize the current minimum value with a number guaranteed to be larger than any possible input.
    // Adding 10 to 'countElements' (which is 'n') ensures it's initially larger than any 'p[i]' if 'p[i]' are positive.
    let currentMinimum = countElements + 10;

    // Loop through each element in the 'elementValues' array.
    for (let idx = 0; idx < countElements; ++idx) {
        // Convert the current string element to an integer.
        const currentValue = parseInt(elementValues[idx]);

        // Check if the current element is less than or equal to the observed minimum so far.
        if (currentValue <= currentMinimum) {
            // If it is, update the minimum value.
            currentMinimum = currentValue;
            // Increment the result counter, as this element meets the condition.
            resultCount++;
        }
    }

    // Output the final calculated count to the console.
    console.log(resultCount);
}

// Read the input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
