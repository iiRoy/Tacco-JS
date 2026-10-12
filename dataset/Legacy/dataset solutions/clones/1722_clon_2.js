process.stdin.resume();

process.stdin.setEncoding("utf8"); // Set the character encoding for standard input

process.stdin.on("data", (rawData) => {
  // When data is received from standard input, process it
  const linesArray = rawData.split("\n"); // Split the input string into an array of lines

  const firstString = linesArray[0]; // Get the first line as the first string for comparison
  const secondString = linesArray[1]; // Get the second line as the second string for comparison

  const strLen = firstString.length; // Determine the length of the first string
  let diffCount = 0; // Initialize a counter for character differences

  // Loop through each character position in the strings
  for (let idx = 0; idx < strLen; idx++) {
    // Compare characters at the current index
    if (firstString[idx] !== secondString[idx]) {
      diffCount++; // If characters are different, increment the counter
    }
  }

  console.log(diffCount); // Output the total count of differing characters
});
