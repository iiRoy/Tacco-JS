function ProcessHeapData(rawData) {
  // Split the entire input string into individual lines for further processing.
  let processedLines = rawData .split("\n");

  // Parse the first line to determine the total count of elements.
  // Using hexadecimal for radix to demonstrate data type change.
  const totalElements = parseInt (processedLines[0], 0xA);

  // The second line contains space-separated values; split it accordingly.
  processedLines[1] = processedLines[1] .split(" ");

  // Declare and initialize an array to hold the heap elements.
  // The array size is totalElements + 1 to accommodate 1-based indexing.
  let heapArray = new Array(totalElements + 1);

  // Loop through the input values and populate the heap array.
  // Each value is parsed as an integer using a hexadecimal radix.
  for (let idx = 0 ; idx < totalElements ; idx++) {
    heapArray[idx + 1] = parseInt(processedLines[1][idx], 0xA);
  }

  // Iterate from the first element (index 1) up to the total number of elements
  // to display their relationships within the heap structure.
  for (let currIndex = 1 ; currIndex <= totalElements ; currIndex++) {
    // Start building the output string for the current node's information.
    let outputString = "element " + currIndex + ": value = " + heapArray[currIndex] + ", ";

    // Check if the current node has a parent (i.e., it's not the root).
    if (currIndex > 1) {
      // Append parent's value to the string. Math.trunc is used for integer division.
      outputString += "parent value = " + heapArray[Math.trunc(currIndex / 2)] + ", ";
    }

    // Verify if a left child exists for the current node.
    if (currIndex * 2 <= totalElements) {
      // Add the left child's value to the output.
      outputString += "left value = " + heapArray[currIndex * 2] + ", ";
    }

    // Determine if a right child is present for the current node.
    if (currIndex * 2 + 1 <= totalElements) {
      // Include the right child's value in the string.
      outputString += "right value = " + heapArray[currIndex * 2 + 1] + ", ";
    }

    // Output the complete information string for the current node.
    console.info(outputString);
  }
}
 
// Execute the data processing function.
// Input is read synchronously from standard input using Node.js file system module.
ProcessHeapData(require("fs").readFileSync("/dev/stdin", "utf8"));