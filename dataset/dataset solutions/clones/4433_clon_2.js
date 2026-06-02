function processStringData(rawData) {
  // Store the input string for manipulation.
  let processedString = rawData;

  // Extract the character at index 1 (the second character).
  const initialChar = processedString.slice(1, 2);

  // Obtain the last character of the string.
  const finalChar = processedString.slice(-1);

  // Calculate the length of the string excluding the first and last characters.
  const middleLength = processedString.length - 2;

  // Output the concatenated result: second char + middle length + last char.
  console.log(initialChar + middleLength + finalChar);
}

// Read input from standard input and pass it to the processing function.
processStringData(require("fs").readFileSync("/dev/stdin", "utf8"));
