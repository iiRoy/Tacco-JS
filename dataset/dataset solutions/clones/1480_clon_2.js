function ProcessInput(rawData) {
  // Convert the raw input string to a numerical value.
  let countValue = Number(rawData);

  // Initialize an empty string to accumulate the result.
  let resultString = "";

  // Define a constant string that will be appended repeatedly.
  const prefixText = "ACL";

  // Loop 'countValue' times to build the final string.
  for (let idx = 0; idx < countValue; idx++) {
    // Append the constant string to the result string in each iteration.
    resultString += prefixText;
  }

  // Output the final concatenated string to the console.
  console.log(resultString);
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
