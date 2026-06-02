function processInputData(rawInputString) {
  // Remove any leading or trailing whitespace from the initial input string.
  let parsedNumbersArray = rawInputString.trim();

  // Split the cleaned string by spaces and then convert each resulting substring into a number.
  parsedNumbersArray = parsedNumbersArray.split(" ").map(Number);

  // Evaluate a specific condition: check if the third number (index 2)
  // falls inclusively between the first (index 0) and second (index 1) numbers.
  // This covers two possible orderings for the first two numbers:
  // 1. The first number is greater than or equal to the third, AND the third is greater than or equal to the second.
  // 2. The first number is less than or equal to the third, AND the third is less than or equal to the second.
  if (
    (parsedNumbersArray[0] >= parsedNumbersArray[2] && parsedNumbersArray[2] >= parsedNumbersArray[1]) ||
    (parsedNumbersArray[0] <= parsedNumbersArray[2] && parsedNumbersArray[2] <= parsedNumbersArray[1])
  ) {
    // If the condition holds true, output "Yes" to the console.
    console.log("Yes");
  } else {
    // Otherwise, if the condition is false, output "No" to the console.
    console.log("No");
  }
}

// Invoke the primary data processing function.
// It reads the entire content of standard input synchronously using Node.js's 'fs' module,
// interpreting the input as a UTF-8 encoded string.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
