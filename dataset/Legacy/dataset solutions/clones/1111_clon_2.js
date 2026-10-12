// This script processes input representing a binary heap or tree structure.
// It reads space or newline-separated values from standard input,
// treats them as keys, and then outputs information for each node:
// its 1-based index, its key, and the keys of its parent, left child, and right child, if they exist.

console.log(
  require('fs') // Access the Node.js file system module
    .readFileSync('/dev/stdin', 'utf8') // Read the entire content of standard input as a UTF-8 string
    .trim() // Remove leading/trailing whitespace from the input string
    .split(/[ |\n]/) // Split the string into an array of substrings using space or newline as delimiters
    .slice(1) // Remove the first element of the array (assuming it's a count or irrelevant header)
    .map((currentKey, currentIdx, allElements) => {
      // The original code increments 'i' (currentIdx) at the very beginning of its use
      // for 1-based indexing in the output and subsequent calculations.
      // We must replicate this exact behavior.
      currentIdx++; // Convert 0-based array index to 1-based node index for this iteration

      let outputSegment = `node ${currentIdx}: key = ${currentKey}, `;

      // Determine and append parent key if it exists (nodes other than the root)
      // The condition (currentIdx - 1) is true for any currentIdx > 1
      if (currentIdx - 1) {
        outputSegment += `parent key = ${allElements[Math.floor(currentIdx / 2) - 1]}, `;
      }

      // Determine and append left child key if it exists
      if (2 * currentIdx - 1 < allElements.length) {
        outputSegment += `left key = ${allElements[2 * currentIdx - 1]}, `;
      }

      // Determine and append right child key if it exists
      if (2 * currentIdx < allElements.length) {
        outputSegment += `right key = ${allElements[2 * currentIdx]}, `;
      }

      return outputSegment; // Return the formatted string for the current node
    })
    .join('\n') // Join all the formatted node strings with newline characters
);
