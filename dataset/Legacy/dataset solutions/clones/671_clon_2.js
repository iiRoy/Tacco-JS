let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input path
const lineBuffer = (rawData.trim()).split('\n'); // Process raw input: trim whitespace and split into an array of lines

while (true) { // Main loop to process multiple test cases
  // Extract the number of entries for the current test case.
  // The `- 0` ensures it's treated as a number, even though map(Number) would do this later.
  let numEntries = lineBuffer.shift() - 0;

  // If the number of entries is zero, it signifies the end of input.
  if (numEntries === 0) {
    break; // Exit the processing loop
  }

  const dataItems = []; // Initialize an array to hold the parsed data items for this test case
  let totalWeight = 0; // Initialize a variable to accumulate the total weight (first element of each item)

  // Loop to read and process each entry for the current test case
  for (let idx = 0; idx < numEntries; idx++) {
    // Read a line, split by space, and convert parts to numbers
    const currentItem = (lineBuffer.shift()).split(' ').map(Number);
    dataItems.push(currentItem); // Add the processed item (an array of two numbers) to our collection
    totalWeight += currentItem[0]; // Add the first number (weight) to the running total
  }

  // Sort the collected data items. The sorting criterion is the second element (value) in descending order.
  dataItems.sort(function(itemA, itemB) {
    const valA = itemA[1]; // Get the value from the first item
    const valB = itemB[1]; // Get the value from the second item
    return valB - valA; // Sort in descending order of value
  });

  let outcome = 'YES'; // Initialize the outcome for the current test case as 'YES'

  // Iterate through the sorted data items to check the condition
  for (let idx = 0; idx < dataItems.length; idx++) {
    const currentDataItem = dataItems[idx]; // Get the current item from the sorted list

    // Check if the current total weight exceeds the value of the current item
    if (totalWeight > currentDataItem[1]) {
      outcome = 'NO'; // If the condition is met, set the outcome to 'NO'
      break; // No need to check further, so break out of this loop
    }
    // Subtract the weight of the current item from the total weight
    totalWeight -= currentDataItem[0];
  }

  console.log(outcome); // Output the final outcome ('YES' or 'NO') for the current test case
}
