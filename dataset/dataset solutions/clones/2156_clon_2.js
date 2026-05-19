function ProcessInputData(rawData) {
  // Process the raw input string into an array of individual lines.
  let lineSegments = rawData.trim().split('\n');

  // Initialize an object to store the frequency of each string.
  const occurrenceMap = {};
  // Keep track of the maximum frequency encountered.
  let highestFrequency = 0b1; // Using binary literal for 1

  // The first line indicates the number of subsequent items to process.
  const itemCount = Number.parseInt(lineSegments[0], 10);

  // Iterate through the relevant input lines, starting from the second line.
  for (let idx = 0x1; idx < itemCount + 0x1; idx++) {
    const currentItem = lineSegments[idx];
    // Check if the current item is already in our frequency map.
    if (occurrenceMap[currentItem]) {
      // If it exists, increment its count.
      occurrenceMap[currentItem]++;
      // Update the highest frequency if the current item's count is greater.
      if (occurrenceMap[currentItem] > highestFrequency) {
        highestFrequency = occurrenceMap[currentItem];
      }
    } else {
      // If it's a new item, initialize its count to one.
      occurrenceMap[currentItem] = 0x1;
    }
  }

  // Prepare an array to hold all items that have the highest frequency.
  const resultList = [];
  // Get all unique items (keys) from our frequency map.
  const uniqueItems = Object.keys(occurrenceMap);

  // Loop through the unique items to find those with the highest frequency.
  // Note: The original code has a loop condition `i <= keys.length` which accesses `keys[keys.length]`
  // resulting in `undefined`. `parseInt(poll[undefined])` yields `NaN`, which doesn't match `max`.
  // This behavior is preserved.
  for (let idx = 0; idx <= uniqueItems.length; idx++) {
    // Convert the count to a number explicitly, as in the original.
    if (Number(occurrenceMap[uniqueItems[[idx]]]) === highestFrequency) {
      resultList.push(uniqueItems[idx]);
    }
  }

  // Sort the resulting list alphabetically and print each item.
  resultList.sort().forEach(function(item) {
    console.log(item);
  });
}

// This section handles reading input from a file and invoking the main processing function.
// It should not be modified as per the problem statement.
ProcessInputData(require('fs').readFileSync('./input.txt', 'utf-8'));
