function processInput(inputData) {
  // This function is designed to ingest and process a block of text input.

  // The entire input string is first broken down into an array,
  // with each element representing a distinct line.
  inputData = inputData.split("\n");

  // From the very first line of the input, we parse various crucial parameters.
  // The initial number on this line denotes the total count of subsequent data entries.
  let numEntries = parseInt(inputData[0].split(" ")[0]);

  // The second number on the first line specifies the minimum required height.
  let minHeight = parseInt(inputData[0].split(" ")[1]);

  // The third number on the first line indicates the minimum required width.
  let minWidth = parseInt(inputData[0].split(" ")[2]);

  // A counter is initialized to keep track of how many items
  // successfully meet the specified height and width criteria.
  let matchingItemsCount = 0;

  // The first line, which contained the configuration parameters,
  // is now removed from the input array as it has been fully processed.
  inputData.shift();

  // We now iterate through the remaining lines of the input array.
  // Each line represents a distinct item with its own dimensions.
  for (
    let idx = 0;
    idx < inputData.length;
    idx++
  ) {
    // For the current item's line, the first number represents its height.
    let currentItemHeight = parseInt(inputData[idx].split(" ")[0]);

    // The second number on the same line represents the item's width.
    let currentItemWidth = parseInt(inputData[idx].split(" ")[1]);

    // A conditional check is performed to determine if the current item's
    // dimensions (height and width) are greater than or equal to
    // the minimum required dimensions previously established.
    if (
      currentItemHeight >= minHeight &&
      currentItemWidth >= minWidth
    ) {
      // If both conditions are satisfied, the counter for matching items is incremented.
      matchingItemsCount++;
    }
  }

  // Finally, the total number of items that met the criteria is printed to the console.
  console.log(matchingItemsCount);
}

// The primary processing function is invoked here,
// reading its input from the standard input stream (e.g., a piped file or direct console input).
processInput(
  require("fs").readFileSync("/dev/stdin", "utf8")
);