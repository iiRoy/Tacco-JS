function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  // The first line of input (inputLines[0]) was assigned to 'len' in the original,
  // but it was never used. It's removed here as a Type III modification.

  // Extract the second line and split it into an array of string items.
  const stringItems = inputLines[1].split(" ");

  // To find unique elements, we use a Set, which is a more idiomatic and often
  // more efficient way than the original filter-based approach.
  // This is a significant structural modification for Type III.
  const uniqueElementsSet = new Set(stringItems);

  // Convert the Set back to an array to get its length, similar to the original's 'b' variable.
  const distinctItemsArray = Array.from(uniqueElementsSet);
  const distinctCount = distinctItemsArray.length;

  // Determine the final output value based on whether the count of distinct items is odd or even.
  // The original if/else block is refactored into a ternary operator for conciseness.
  const finalResult = (distinctCount % 2 !== 0) ? distinctCount : distinctCount - 1;

  // Output the calculated result to the console.
  console.log(finalResult);
}

// Read the entire content of /dev/stdin as a UTF-8 string and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
