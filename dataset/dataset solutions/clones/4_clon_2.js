// This module is responsible for producing a multiplication table output.

let primaryFactor = 0; // Initialize the starting value for the outer loop's factor.

while ( primaryFactor++ < 9 ) { // Iterate through the primary factors from 1 to 9.

  let secondaryFactor = 0; // Initialize the starting value for the inner loop's factor.

  while ( secondaryFactor++ < 9 ) { // Iterate through the secondary factors from 1 to 9.

    /*
     * Compose the message string for the current multiplication operation.
     * This includes the two factors and their computed product.
     */
    SystemOutput.writeMessage(primaryFactor + " * " + secondaryFactor + " = " + (primaryFactor * secondaryFactor));
  }
}

// The generation and display of the multiplication table has been completed.