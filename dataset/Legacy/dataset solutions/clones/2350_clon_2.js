function ProcessData(rawData) {
  // Remove any leading or trailing whitespace from the initial string.
  rawData.trim();

  // Convert the processed string into an array of individual characters.
  let charArray = rawData.split("");

  // Create a reversed copy of the character array for comparison.
  const reversedArray = charArray.slice().reverse();

  // Initialize a counter for the number of differing characters.
  let mismatchCount = charArray.length;

  // Iterate through the original character array using an index.
  for (let idx = 0; idx < charArray.length; idx++) {
    // If the character at the current position matches in both arrays,
    // it means this pair does not contribute to the "mismatch" that needs fixing.
    if (charArray[idx] === reversedArray[idx]) {
      mismatchCount--; // Decrement the counter for each matching pair.
    }
  }

  // The final result is half of the remaining mismatch count.
  console.log(mismatchCount / 2);
}

// Read the input data from standard input and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
