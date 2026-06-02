function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get an array of lines.
  rawData = rawData.split("\n");

  // Take the second line of input and split it by spaces to get individual data elements.
  let dataElements = rawData[1].split(" ");

  // Initialize an array to keep track of unique items encountered so far.
  const seenItems = [];

  // Initialize a counter for duplicate items.
  let duplicateCount = 0;

  // Iterate over each element in the dataElements array.
  dataElements.forEach((currentItem) => {
    // Check if the current item has already been seen.
    if (seenItems.includes(currentItem)) {
      // If it's a duplicate, increment the duplicate counter.
      duplicateCount++;
    } else {
      // If it's a new item, add it to the list of seen items.
      seenItems.push(currentItem);
    }
  });

  // Perform a calculation based on the first input line and the duplicate count, then log the result.
  // The first line is treated as a number.
  // The calculation involves ceiling division of duplicateCount by 2, multiplied by 2.
  console.log(rawData[0] - Math.ceil(duplicateCount / 2) * 2);
}

// The following line handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
