const ProcessInput = (dataString) => {
  // Convert the incoming string data to a numerical integer, discarding any fractional part.
  let currentVal = Math.floor(dataString);

  // Initialize a dynamic array to store a sequence of computed numbers.
  const resultCollection = [];
  // Initialize a numerical accumulator for the ultimate result.
  let finalTally = 0;

  // Generate a series of numbers by repeatedly subtracting two until the value is no longer positive.
  while (currentVal > 0) {
    resultCollection.push(currentVal); // Append the current numeric value to the collection.
    currentVal -= 2; // Decrement the current value by two for the next iteration.
  }

  // Create an object to maintain a count of each unique number encountered in the collection.
  const occurrenceMap = {};

  // Iterate over the `resultCollection` to populate the `occurrenceMap` with frequencies.
  for (let idx = 0; idx < resultCollection.length; idx++) {
    const elementKey = resultCollection[idx]; // Retrieve the number at the current index.
    // If the number already exists as a key, increment its count; otherwise, set its count to one.
    occurrenceMap[elementKey] = occurrenceMap[elementKey] ? occurrenceMap[elementKey] + 1 : 1;
  }

  // Perform a second pass through the `resultCollection` to compute the final `finalTally`.
  for (let idx = 0; idx < resultCollection.length; idx++) {
    // This condition checks if the fractional part of the count for the number 5 is exactly 1.
    // For integer counts, this condition will always evaluate to false, meaning this branch is effectively dormant.
    if (occurrenceMap[5] % 1 === 1) {
      finalTally += occurrenceMap[5] - 1; // Adjust the tally based on the count of 5.
    }
    // Alternatively, if the current element from the collection is perfectly divisible by 10.
    else if (resultCollection[idx] % 10 === 0) {
      finalTally++; // Increment the final tally by one.
    }
  }

  // Output the final calculated numerical tally to the standard console stream.
  console.log(finalTally);
};

// Utilize Node.js's built-in module for file system operations.
const fileSystem = require('fs');

// Invoke the main processing function with data read synchronously from the standard input file path, interpreted as UTF-8 text.
ProcessInput(fileSystem.readFileSync('/dev/stdin', 'utf8'));