function ProcessInput(rawData) {
  // Convert the raw input to an integer value.
  let currentValue = Math.floor(rawData);

  // Initialize a collection to store processed numbers.
  const resultCollection = [];
  // Initialize the final accumulated sum.
  let finalSum = 0;

  // Loop while the current value is positive.
  while (currentValue > 0) {
    resultCollection.push(currentValue); // Add the current value to the collection.
    currentValue -= 2; // Decrement the current value by two.
  }

  // Create a map to count frequencies of numbers.
  const frequencyMap = {};

  // Iterate through the collected numbers to populate the frequency map.
  for (let idx = 0; idx < resultCollection.length; idx++) {
    const itemKey = resultCollection[idx]; // Get the current number.
    // Increment its count, or initialize to 1 if not seen before.
    frequencyMap[itemKey] = frequencyMap[itemKey] ? frequencyMap[itemKey] + 1 : 1;
  }

  // Perform a second iteration to calculate the final sum based on specific conditions.
  for (let idx = 0; idx < resultCollection.length; idx++) {
    // Check a specific condition related to the count of number 5.
    if (frequencyMap[5] % 1 === 1) {
      finalSum += frequencyMap[5] - 1; // Adjust sum based on count of 5.
    }
    // Check if the current number in the collection is a multiple of 10.
    else if (resultCollection[idx] % 10 === 0) {
      finalSum++; // Increment sum if it's a multiple of 10.
    }
  }
  // Output the computed final sum to the console.
  console.log(finalSum);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
