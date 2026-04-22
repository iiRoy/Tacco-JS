/* This script processes input data to find a specific BigInt value. */
// The primary goal is to find an 'index' that satisfies a complex XOR condition.

console.log(
  (
    // Anonymous function to encapsulate the core logic and process input
    (incomingText) => {
      // Parse the input string into a structured array of BigInts.
      // The first line contains a single BigInt representing the total count for the inner loop.
      // The second line contains an array of BigInts that will be used in calculations.
      const [
        [totalElementsCount],
        bigIntValuesCollection
      ] = incomingText
          .trim() // Remove leading/trailing whitespace from the entire input
          .split('\n') // Split the input into lines
          .map(
            (lineContent) =>
              lineContent.split(' ') // Split each line into space-separated strings
                         .map(
                            (numString) => BigInt(numString) // Convert each string part to a BigInt
                         )
          );

      // Iterate through a range of potential 'candidate' values.
      // The range starts from 1n and goes up to the value of the first element in 'bigIntValuesCollection'.
      for (
        let candidateIteration = 1n; // Initialize the loop counter, representing the current candidate
        candidateIteration <= bigIntValuesCollection[0]; // Continue as long as the candidate is within the specified bound
        candidateIteration++ // Increment the candidate for the next iteration
      ) {
        // Calculate an initial XOR sum.
        // This sum uses the first two elements of 'bigIntValuesCollection'
        // and incorporates the current 'candidateIteration' value.
        let calculatedXorSum =
          (bigIntValuesCollection[0] - candidateIteration) ^
          (bigIntValuesCollection[1] + candidateIteration);

        // Loop through the remaining elements in 'bigIntValuesCollection',
        // starting from the third element (index 2).
        for (
          let elementPointer = 2; // Start iterating from the third element's index
          elementPointer < totalElementsCount; // Loop continues as long as the pointer is less than the total count
          elementPointer++ // Move to the next element in the collection
        ) {
          // Update the XOR sum by XORing it with the current element from the collection.
          calculatedXorSum ^= bigIntValuesCollection[elementPointer];
        }

        // After processing all relevant elements for the current 'candidateIteration',
        // check if the final 'calculatedXorSum' is zero.
        if (calculatedXorSum === 0n) { // If the XOR sum is zero (BigInt zero)
          return String(candidateIteration); // Return the string representation of the found candidate
        }
      }

      // If the loop completes without finding any 'candidateIteration' that results in a zero XOR sum,
      // return the string '-1' to indicate no solution was found.
      return '-1';
    }
  )(
    require('node:fs').readFileSync('/dev/stdin', 'utf8') // Read the entire input content from standard input as a UTF-8 string
  )
);