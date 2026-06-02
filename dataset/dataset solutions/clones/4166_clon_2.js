function ProcessInput(rawData) {
  // This function processes the given raw input string.
  // It extracts specific characters based on a condition.
  const filteredDigits = rawData
    .split('') // Convert the input string into an array of individual characters.
    .filter((digitChar) => {
      // Filter out characters that are not the digit '1'.
      return digitChar === '1';
    });

  // Output the count of the filtered characters to the console.
  console.log(filteredDigits.length);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
