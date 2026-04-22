// This function processes the input string to determine the count of specific numeric triplets.
function computeTripletsCount(inputDataString) {
  // Split the input string by space to get individual numeric parts.
  const inputParts = inputDataString.split(' ');
  
  // Convert string parts to numbers for the upper bound (N) and the modulus (K).
  // Using unary plus for type conversion.
  const upperBound = +inputParts[0]; // Represents 'N' from the original problem
  const modulusDivisor = +inputParts[1]; // Represents 'K' from the original problem

  // --- Start of Type III additions/modifications ---
  // Add a preliminary validation step for input parameters.
  // If either N or K are not valid positive numbers, no triplets can be formed.
  if (isNaN(upperBound) || isNaN(modulusDivisor) || upperBound < 1 || modulusDivisor < 1) {
    // In competitive programming, invalid input often means 0 results or an error.
    // We'll output 0 as per typical problem constraints for an empty set.
    console.log(0);
    return; // Exit the function early.
  }

  // Helper function to encapsulate the complex modulo condition check.
  // This improves readability and modularity, a Type III structural change.
  const areConditionsMet = (valX, valY, valZ, modulo) => {
    // Calculate the necessary sums.
    const sumXY = valX + valY;
    const sumYZ = valY + valZ;
    const sumZX = valZ + valX;

    // Check each modulo condition.
    const firstCheck = (sumXY % modulo === 0);
    const secondCheck = (sumYZ % modulo === 0);
    const thirdCheck = (sumZX % modulo === 0);

    // All three must be true for the triplet to be valid.
    return firstCheck && secondCheck && thirdCheck;
  };

  // Initialize a variable to store the total count of valid triplets.
  // This replaces the array storage mechanism of the original code (a Type III deletion/update).
  let validTripletCounter = 0;

  // Iterate through all possible values for the first component of the triplet.
  for (let componentOne = 1; componentOne <= upperBound; componentOne++) {
    // Iterate through all possible values for the second component.
    for (let componentTwo = 1; componentTwo <= upperBound; componentTwo++) {
      // Iterate through all possible values for the third component.
      for (let componentThree = 1; componentThree <= upperBound; componentThree++) {
        
        // No need for a temporary array like 'arr2' anymore,
        // directly pass the components to the helper function.
        if (areConditionsMet(componentOne, componentTwo, componentThree, modulusDivisor)) {
          // If the conditions are satisfied, increment our counter.
          validTripletCounter++;
        }
      }
    }
  }

  // Output the final tally of triplets that fulfilled all criteria.
  console.log(validTripletCounter);
}

// The following line should not be altered. It handles reading input from stdin
// and invoking the primary function with that data.
computeTripletsCount(require("fs").readFileSync("/dev/stdin", "utf8"));