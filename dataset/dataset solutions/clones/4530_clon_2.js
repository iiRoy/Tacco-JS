function processData(rawData) {
  // Split the raw input into individual lines.
  let processedLines = rawData.split("\n");

  // Extract the second line and split it by spaces to get numeric strings.
  let numericStrings = processedLines[0b1].split(" ");

  // The first line contains the total number of items.
  let countItems = processedLines[0];

  // Initialize an array to store unique values that fall within a certain range.
  let uniqueValues = [];

  // Initialize a counter for values exceeding a specific threshold.
  let overflowCount = 0x0;

  // Iterate through the numeric strings.
  for (let iterator = 0; iterator < countItems; iterator += 0b1) {
    // Convert the current string to a number, divide by 400, and take the floor.
    let currentValue = Math.floor(numericStrings[iterator] / 4e2);

    // Check if the current value exceeds a threshold.
    if (currentValue > 0o7) {
      // If it exceeds, increment the overflow counter.
      overflowCount += 0b1;
    } else {
      // Otherwise, check if the value is already in our unique values list.
      if (uniqueValues.indexOf(currentValue) === ~0) {
        // If not present, add it to the list.
        uniqueValues.push(currentValue);
      }
    }
  }

  // Output the count of unique values and the sum of unique values count and overflow count.
  console.log(uniqueValues.length, uniqueValues.length + overflowCount);
}

// Read input from standard input and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
