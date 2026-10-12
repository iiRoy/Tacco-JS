// This function processes the provided text data.
function handleDataProcessing(incomingText) {
  incomingText = incomingText.split("\n")[0]; // Extract the first line of input.

  // Parse the first number from the processed line.
  const valueA = parseInt(incomingText.split(' ')[0]);
  // Parse the second number from the processed line.
  const radixB = parseInt(incomingText.split(' ')[1]);

  // Convert the first number to a string using the second number as the radix,
  // then output the length of the resulting string.
  console.log(valueA.toString(radixB).length);
}

/* Do not modify the following section; it handles standard input/output and invokes the primary processing function. */
handleDataProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
