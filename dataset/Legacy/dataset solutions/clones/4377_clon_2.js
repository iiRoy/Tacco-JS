function ProcessInput(rawData) {
  // Split the incoming data into individual characters.
  let charArray = rawData.split("");

  // Initialize an empty string to store the filtered result.
  let resultString = "";

  // Iterate through the character array using an index.
  for (let idx = 0; idx < charArray.length; idx++) {
    // Check if the current index is even.
    if (idx % 2 === 0) {
      // If the index is even, append the character at this index to the result string.
      resultString += charArray[idx];
    }
  }

  // Output the final constructed string to the console.
  console.log(resultString);
}

// Read input from standard input, decode as UTF-8, trim whitespace, and then pass to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
