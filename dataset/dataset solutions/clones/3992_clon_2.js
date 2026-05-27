/*
 * This script processes numerical input to calculate a specific value.
 * It handles large numbers by splitting them into parts for calculation.
 */
function ProcessInput(rawData) {
    // Split the entire raw input data by newline characters.
    const inputLines = rawData.split("\n");

    // Take the first line and split it by spaces to get individual parts.
    let firstLineParts = inputLines[0].split(" ");

    // Convert the first part to a number, representing 'N'.
    let firstNum = Number(firstLineParts[0]);

    // Convert the second part to a number, representing 'M'.
    let secondNum = Number(firstLineParts[1]);

    // Calculate the initial result using absolute difference.
    let resultValue = Math.abs((secondNum - 2) * (firstNum - 2));

    // Check if the calculated result exceeds a very large threshold.
    if (resultValue > 1000000000000000) {
        // If it's too large, perform calculations in parts to avoid overflow or precision issues.
        let firstNumUpper = Math.floor(firstNum / 1000); // Upper part of N
        let firstNumLower = firstNum % 1000; // Lower part of N

        // Calculate the lower part of the answer.
        let lowerPartResult = (firstNumLower - 2) * Math.abs(secondNum - 2);

        // Re-calculate the result by combining upper and lower parts.
        // The `+ ""` converts the number to a string for concatenation.
        resultValue = (firstNumUpper * Math.abs(secondNum - 2) + Math.floor(lowerPartResult / 1000)) + "";
        resultValue += lowerPartResult % 1000 + ""; // Append the remainder.
    }

    // Output the final calculated result to the console.
    console.log(resultValue);
}

// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
