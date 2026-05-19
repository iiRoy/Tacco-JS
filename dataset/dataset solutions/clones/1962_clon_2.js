function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const linesOfData = rawData.split('\n');

  // Parse the first line to extract the total capacity and the count of items.
  // The second value (numberOfItems) is destructured but not directly used in the final calculation.
  const [totalCapacity, numberOfItems] = linesOfData[0].split(' ').map(Number);

  // Parse the second line to get an array containing the sizes of individual items.
  const itemSizes = linesOfData[1].split(' ').map(Number);

  // Calculate the cumulative sum of all item sizes.
  const totalSize = itemSizes.reduce((currentTotal, itemValue) => {
    return currentTotal + itemValue; // Add each item's value to the running total.
  }, 0); // Initialize the sum with zero.

  // Determine the result based on whether the total item size exceeds the available capacity.
  // If the remaining capacity is negative, it indicates an overflow, so output -1.
  // Otherwise, output the positive remaining capacity.
  console.log(totalCapacity - totalSize < 0 ? -1 : totalCapacity - totalSize);
}

// Read the input data from standard input using Node.js file system module
// and then pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
