function performAnalysis(receivedData) {
  // Remove any superfluous leading or trailing blank spaces from the incoming string.
  const cleanedData = receivedData.trim();

  // Divide the processed string into an array of substrings using space as a delimiter,
  // then convert each resulting substring into its numerical representation.
  const valueArray = cleanedData
    .split(" ")
    .map(Number);
 
  // Based on a specific condition, output a corresponding status message.
  // The condition checks if the sum of the first two numerical elements
  // is greater than or equal to the third numerical element.
  console.log(
    (valueArray[0] + valueArray[1] >= valueArray[2])
      ? "Proceed"
      : "Halt"
  );
}

// Initiate the primary execution flow by reading data from standard input.
// The file system module is used to synchronously read the content,
// interpreting it as a UTF-8 encoded string.
performAnalysis(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);