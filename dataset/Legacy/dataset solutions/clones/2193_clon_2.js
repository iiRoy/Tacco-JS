function ProcessInput ( rawData ) {
  // Clean and split the raw input into lines.
  rawData = rawData.trim().split('\n');

  // Extract the second value from the first line, which is our limit.
  let limitVal = rawData[0].split(' ')[1];

  // Process the second line of input.
  console.log(
    rawData[1]
      .split(' ')
      .sort((valA, valB) => valB - valA) // Sort numbers in descending order.
      .map(Number) // Convert string elements to numbers.
      .reduce((accumulator, currentValue, currentIndex) => {
        // Sum values only if their index is not within the initial 'limitVal' items.
        return currentIndex < limitVal ? accumulator : accumulator + currentValue;
      }, 0) // Initialize the sum to zero.
  );
}

// Invoke the main processing function with input from standard input.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
