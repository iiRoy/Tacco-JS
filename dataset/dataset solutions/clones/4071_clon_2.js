function processInput(inputString) {
    // Process the input string to extract relevant parts.
    // First, split by newline and take the first line.
    // Then, split that line by space to get individual values.
    let parsedValues = inputString.split("\n")[0].split(" ");

    // Concatenate the first two parsed string values and convert to a number.
    // This forms the number 'combinedNumber' from the input parts.
    let combinedNumber = Number(parsedValues[0] + parsedValues[1]);

    // Calculate the square root of the combined number.
    // Check if the square root is an integer by using the modulo operator with 1.
    // If the remainder is 0, it means the number is a perfect square.
    // Output "Yes" if it's a perfect square, otherwise "No".
    console.log(Math.sqrt(combinedNumber) % 1 === 0 ? "Yes" : "No");
}

// Read the input from standard input using Node.js file system module.
// The content is read synchronously and encoded as UTF-8.
// This content is then passed to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
