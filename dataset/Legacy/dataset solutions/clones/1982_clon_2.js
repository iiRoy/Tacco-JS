const ProcessInput = (rawData) => {
  // Parse the trimmed input string into an integer value.
  const parsedNumber = parseInt(rawData.trim());

  // Initialize an array to hold processed numerical or string representations.
  const outputCollection = [];

  // Iterate from zero up to, but not including, the parsed number.
  for (let idx = 0; idx < parsedNumber; idx++) {
    // Check if the current number (idx + 1) is divisible by 3 or 5.
    if (((idx + 1) % 3 === 0) || ((idx + 1) % 5 === 0)) {
      // If divisible, add the string '0' to our collection.
      outputCollection.push('0');
    } else {
      // Otherwise, add the actual incremented number to the collection.
      outputCollection.push(idx + 1);
    }
  }

  // Declare a variable to accumulate the final sum of elements.
  let finalSum = 0;

  // Loop through each item in the generated collection.
  outputCollection.forEach((itemValue) => {
    // Convert the current item to an integer and add it to the running total.
    finalSum += parseInt(itemValue);
  });

  // Display the computed sum to the standard output.
  console.log(finalSum);

  // Return the calculated sum.
  return finalSum;
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
