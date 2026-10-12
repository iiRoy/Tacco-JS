process.stdin.resume();

process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

// Event listener for data received from standard input
process.stdin.on('data', function (inputData) {
    // Process the raw input string
    let parsedNumbers = inputData
        .toString() // Convert buffer to string
        .split("\n") // Split the string by newline characters into an array
        .map(currentVal => Number(currentVal)) // Convert each array element to a number
        .filter(currentVal => currentVal !== 0); // Remove any zero values from the array

    // Extract specific portions of the processed numbers array
    const firstGroup = parsedNumbers.slice(0, 3); // Get the first three elements
    const secondGroup = parsedNumbers.slice(3, 5); // Get elements from index 3 up to (but not including) 5

    // Find the minimum value in each extracted group
    const minOfFirst = Math.min.apply(null, firstGroup);
    const minOfSecond = Math.min.apply(null, secondGroup);

    // Calculate the final result based on the minimums
    const finalResult = minOfFirst + minOfSecond - 50;

    // Output the computed result to the console
    console.log(finalResult);
});
