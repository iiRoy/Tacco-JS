// This function serves as the primary entry point for processing the input data.
function ProcessInput(rawData) {
  // The initial raw data string is split by newline characters.
  // We then take only the first line of input for further processing.
  let processedLine = rawData.split("\n")[0];

  // The single processed line is then split by spaces.
  // Each resulting string segment is converted into an integer using parseInt.
  // This creates an array of numerical dimensions.
  const parsedDimensions = processedLine.split(' ').map(currentStr => parseInt(currentStr, 10));

  // Extract the height value from the first element of the dimensions array.
  let heightVal = parsedDimensions[0];
  // Extract the width value from the second element of the dimensions array.
  let widthVal = parsedDimensions[1];

  // Declare a variable to store the final computed outcome.
  let resultValue;

  // Check for a specific condition: if either the height or the width is equal to 1.
  if (heightVal === 1 || widthVal === 1) {
    // If the condition is met, the outcome is set directly to 1.
    resultValue = 1;
  } else {
    // If neither dimension is 1, proceed with a more complex calculation.
    // The base calculation involves multiplying the height by the floor of (width divided by 2).
    resultValue = heightVal * Math.floor(widthVal / 2);

    // Additionally, check if the width is an odd number.
    if (widthVal % 2 === 1) {
      // If the width is odd, add the rounded value of (height divided by 2) to the current result.
      resultValue += Math.round(heightVal / 2);
    }
  }

  // Finally, print the calculated result to the standard output.
  console.log(resultValue);
}

// The following code block is responsible for reading input from the standard input stream
// and then invoking the main processing function with that input.
// This part should remain unchanged to ensure proper interaction with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
