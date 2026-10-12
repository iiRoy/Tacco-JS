function ProcessInput(inputString) {
  // Split the incoming string by spaces to get individual components.
  let tokenArray = inputString.split(" ");

  // Convert the first three components to numbers using the unary plus operator.
  const valA = +tokenArray[0];
  const valB = +tokenArray[1];
  const valC = +tokenArray[2]; // This variable is declared but not used in the final calculation.

  // The fourth component is treated as a string.
  let strK = tokenArray[3];

  // Extract the last character of the 'strK' string and parse it as an integer.
  const lastDigit = parseInt(strK[strK.length - 1]);

  // Determine the output based on whether the 'lastDigit' is even or odd.
  // If even, calculate valA - valB; otherwise, calculate valB - valA.
  console.log(lastDigit % 2 === 0 ? valA - valB : valB - valA);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
