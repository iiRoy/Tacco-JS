// This function handles the primary processing of the provided data.
function ProcessInput(rawData) {
  // The raw input string is split into an array of strings based on spaces.
  let parsedData = rawData.split(" ");

  // Convert the first and second elements of the array to integers.
  // The radix 10 is explicitly used for decimal conversion.
  const firstNum = parseInt(parsedData[0], 10);
  const secondNum = parseInt(parsedData[1], 10);

  // Determine the output based on a modulo operation.
  if (firstNum % secondNum === 0) {
    // If the remainder is zero, print 0.
    console.log(0);
  } else {
    // Otherwise, print 1.
    console.log(1);
  }
}

// The following line is for standard input/output handling and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
