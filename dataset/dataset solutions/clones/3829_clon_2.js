// This function processes the raw input data to find a specific substring based on an index.
function ProcessInput(rawData) {
  // Split the incoming raw data string by any whitespace characters.
  const parsedData = rawData.split(/\s/g);

  // The first element from the parsed data is considered the primary string.
  const mainString = parsedData[0];

  // The second element, after conversion to a number and decrementing by one,
  // represents the zero-based index of the desired substring in the final sorted list.
  const desiredIndex = parsedData[1] - 1;

  // Calculate the total character length of the main string.
  const stringLength = mainString.length;

  // Generate a two-dimensional array (matrix) containing all possible substrings.
  // The outer map iterates through all possible starting positions (rowIndex).
  const substringMatrix = new Array(stringLength).fill('')
    .map((rowVal, rowIndex) => {
      // The inner map iterates through all possible lengths (colIndex) for a given starting position.
      return new Array(stringLength).fill('').map((colVal, colIndex) => {
        // Extract a substring from the main string starting at 'rowIndex' with a length of 'colIndex'.
        return mainString.substr(rowIndex, colIndex);
      });
    });

  // Initialize an array to accumulate all substrings, starting with the full main string itself.
  const allSubstrings = [mainString];

  // Iterate over the generated substring matrix and flatten it into the 'allSubstrings' array.
  // Each inner array (subArray) from the matrix is spread into the main collection.
  substringMatrix.forEach((subArray) => {
    allSubstrings.push(...subArray);
  });

  // Process the collected substrings through a series of operations:
  // 1. Filter out any empty strings that might have been generated (e.g., substr(x, 0)).
  // 2. Sort the remaining non-empty substrings alphabetically in ascending order.
  // 3. Filter out duplicate entries to ensure only unique substrings remain in their sorted order.
  const uniqueSortedSubstrings = allSubstrings
    .filter((currentSubstring) => currentSubstring) // Keep only non-empty strings.
    .sort() // Sort the substrings alphabetically.
    .filter((element, idx, arrRef) => arrRef.indexOf(element) === idx); // Remove duplicates.

  // Print the substring located at the 'desiredIndex' from the final unique and sorted list.
  console.log('%s', uniqueSortedSubstrings[desiredIndex]);
}

// Read the input from standard input using Node.js's file system module,
// specifying UTF-8 encoding, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
