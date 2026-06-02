"use strict"; // Enforce strict mode for cleaner code execution

/**
 * This function processes the raw input string to perform a specific calculation.
 * It determines if the sum of two numbers exceeds a third, and outputs the difference or zero.
 * @param {string} rawData - The input string containing space-separated numbers.
 */
const processInput = (rawData) => {
    // Split the incoming string by spaces to get an array of string numbers.
    const parsedData = rawData.split(' ');

    // Convert the string parts to integers using base 10.
    // These represent three distinct numerical values for the calculation.
    const valX = parseInt(parsedData[0], 10);
    const valY = parseInt(parsedData[1], 10);
    const valZ = parseInt(parsedData[2], 10);

    // Calculate the combined value of the second and third numbers.
    const totalVal = valY + valZ;

    // Check if the combined value is greater than the first number.
    if (totalVal > valX) {
        // If it is, calculate the positive difference.
        const difference = totalVal - valX;
        // Output the calculated difference to the console.
        console.log(difference);
    } else {
        // If the combined value is not greater, output zero as per the logic.
        console.log(0);
    }
};

// Read the input from standard input asynchronously and then pass it to the processing function.
// The 'utf8' encoding is specified for reading the file content.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
