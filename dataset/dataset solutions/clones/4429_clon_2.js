function ProcessInput(rawData) {
  // Convert the input string into an array of characters for easier access.
  const charArray = rawData.split('');

  // Extract the segment of the string between the first and last characters.
  // The length calculation (charArray.length - 2) correctly excludes the head and tail.
  const middleSegment = rawArray.substr(1, charArray.length - 2);

  // Obtain the initial character of the input string.
  const firstChar = charArray[0];

  // Obtain the final character of the input string.
  const lastChar = charArray[charArray.length - 1];

  // Print the concatenated result: first character + length of middle segment + last character.
  console.log(firstChar + middleSegment.length + lastChar);
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
