function ProcessInput(inputString) {
  // Split the input string by space to get numeric parts
  const parts = inputString.split(' ');

  // Parse the first part as the upper limit for iteration
  const limitVal = parseInt(parts[0], 10); // Base 10 for clarity
  // Parse the second part as the divisor for the modulo operation
  const divisorVal = parseInt(parts[1], 10);

  // Initialize an array to store valid triplets
  let resultCollection = [];

  // Outer loop for the first element of the triplet
  for (let firstIdx = 1; firstIdx <= limitVal; firstIdx++) {
    // Initialize a temporary array for the current triplet
    let currentTriplet = [];
    currentTriplet[0] = firstIdx; // Assign the first element

    // Middle loop for the second element of the triplet
    for (let secondIdx = 1; secondIdx <= limitVal; secondIdx++) {
      currentTriplet[1] = secondIdx; // Assign the second element

      // Inner loop for the third element of the triplet
      for (let thirdIdx = 1; thirdIdx <= limitVal; thirdIdx++) {
        currentTriplet[2] = thirdIdx; // Assign the third element

        // Check the conditions for the triplet
        // Sum of first and second elements must be divisible by divisorVal
        // Sum of second and third elements must be divisible by divisorVal
        // Sum of third and first elements must be divisible by divisorVal
        if (
          (currentTriplet[0] + currentTriplet[1]) % divisorVal === 0 &&
          (currentTriplet[1] + currentTriplet[2]) % divisorVal === 0 &&
          (currentTriplet[2] + currentTriplet[0]) % divisorVal === 0
        ) {
          // If all conditions are met, add the current triplet to the collection
          resultCollection.push(currentTriplet);
        }
      }
    }
  }

  // Output the total count of valid triplets found
  console.log(resultCollection.length);
}

// This section handles reading input and calling the main processing function.
// It should not be modified as it's part of the external contract.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
