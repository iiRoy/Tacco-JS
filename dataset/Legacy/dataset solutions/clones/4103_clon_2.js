function processInput(rawData) {
  // The original code had a commented-out example: "4,10,8,8,6"
  // This function splits the incoming raw data using the literal string "/n" as a delimiter.
  const parsedLines = rawData.split("/n");

  // Output the array of parsed lines to the console.
  console.log(parsedLines);

  // Extract the first element and a subset of the remaining elements.
  // The first element is stored in 'firstElement'.
  const firstElement = parsedLines[0];
  // 'numberStrings' contains elements from the second up to, but not including, the last element.
  const numberStrings = parsedLines.slice(1, parsedLines.length - 1);

  // Determine the count of unique string values within 'numberStrings' and print it.
  // A Set is used to automatically handle uniqueness.
  console.log(Array.from(new Set(numberStrings)).length);
}

// Execute the main processing function by reading content from standard input.
// The 'fs' module is used to synchronously read the entire file content as a UTF-8 string.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
