function processInput(rawData) {
  // Split the raw input string into an array of lines.
  const lineData = rawData.split("\n");

  // Assign the first line to 'firstString'.
  const firstString = lineData[0];
  // Assign the second line to 'secondString'.
  const secondString = lineData[1];

  // Convert the first string into an array of its characters.
  const firstChars = firstString.split('');
  // Convert the second string into an array of its characters.
  const secondChars = secondString.split('');
  
  // Initialize a counter for matching characters.
  let matchCounter = 0;

  // Iterate through the first three positions (indices 0, 1, 2).
  for (let idx = 0; idx < 3; idx++) {
    // Check if the character at the current index in both arrays is identical.
    if (firstChars[idx] === secondChars[idx]) {
      // If they match, increment the counter.
      matchCounter++;
    }
  }

  // Print the final count of matching characters to the console.
  console.log(matchCounter);
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the 'processInput' function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
