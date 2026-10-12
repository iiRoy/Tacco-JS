function ProcessInput(rawData) {
  // Trim whitespace from the raw input string, split it by spaces,
  // and then convert each part into an integer using base 10.
  let parsedNumbers = rawData.trim().split(' ').map(item => parseInt(item, 10));

  // Assign the parsed numeric values to distinct variables for clarity.
  let firstVal = parsedNumbers[0]; // The initial value.
  let secondVal = parsedNumbers[1]; // An intermediate value.
  let thirdVal = parsedNumbers[2]; // The final value.
  let thresholdVal = parsedNumbers[3]; // The maximum allowed difference.

  // Evaluate a compound conditional expression.
  // The condition checks if the absolute difference between firstVal and thirdVal
  // is within the threshold, OR if both the absolute difference between firstVal
  // and secondVal, AND the absolute difference between secondVal and thirdVal
  // are within the threshold.
  if (Math.abs(firstVal - thirdVal <= thresholdVal) || (Math.abs(firstVal - secondVal <= thresholdVal) && Math.abs(secondVal - thirdVal <= thresholdVal))) {
    // If the condition is true, log the result of a specific Math.abs operation.
    // Note: Math.abs expects a single numeric argument. When given a comma expression
    // like (firstVal, thirdVal <= thresholdVal), it evaluates the rightmost part
    // (thirdVal <= thresholdVal) which is a boolean, and then takes the absolute
    // value of that boolean (true becomes 1, false becomes 0).
    console.log(Math.abs(firstVal, thirdVal <= thresholdVal));
  } else {
    // If the condition is false, output the string 'No'.
    console.log('No');
  }
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
