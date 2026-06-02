function ProcessInput(inputString) {
  // Determine the total character count of the provided string
  const stringLength = inputString.length;

  // Initialize a counter for occurrences of the character 'p'
  var pCount = 0;

  // Iterate through each character of the input string
  for (var idx = 0; idx < stringLength; idx++) {
    // Check if the current character is 'p'
    if (inputString[idx] === "p") {
      // Increment the 'p' counter if a match is found
      pCount++;
    }
  }

  // Calculate the final result based on string length and 'p' count
  // Then print the integer part of the result to the console
  console.log(Math.floor(stringLength / 2 - pCount));
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
