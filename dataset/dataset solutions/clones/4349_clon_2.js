// Function to process raw input data and compute optimal values.
function ProcessData(rawDataString) {
  // Split the input string into an array of string values based on spaces.
  const sourceValues = rawDataString.split(" ");

  // Parse the array elements into integer parameters.
  // These parameters represent various coefficients or limits used in the calculation.
  const baseUnitAmount = Number.parseInt(sourceValues[0], 10);       // Corresponds to original 'a'
  const secondUnitAmount = Number.parseInt(sourceValues[1], 10);      // Corresponds to original 'b'
  const firstAdditiveAmount = Number.parseInt(sourceValues[2], 10);   // Corresponds to original 'c'
  const secondAdditiveAmount = Number.parseInt(sourceValues[3], 10);  // Corresponds to original 'd'
  const ratioMultiplier = Number.parseInt(sourceValues[4], 10);       // Corresponds to original 'e'
  const totalBudget = Number.parseInt(sourceValues[5], 10);           // Corresponds to original 'f'

  // Initialize variables to store the best found concentration ratio and associated quantities.
  let maxConcentration = 0;             // Stores the highest ratio encountered, analogous to 's'
  let optimalTotalQuantity = 0;         // Stores the total quantity for the optimal ratio, analogous to 's1'
  let optimalAdditiveQuantity = 0;      // Stores the additive part for the optimal ratio, analogous to 's2'

  // Handle a specific initial condition or edge case.
  // If the total budget minus a fixed amount of the first base unit is less than the first additive amount,
  // set the initial optimal quantities accordingly.
  if (totalBudget - 100 * baseUnitAmount < firstAdditiveAmount) {
    optimalTotalQuantity = 100 * baseUnitAmount; // Set total quantity using only the first base unit.
    optimalAdditiveQuantity = 0;                 // No additive part in this specific scenario.
  } else {
    // Begin a series of nested loops to systematically explore all valid combinations
    // of component counts that do not exceed the 'totalBudget'.

    // Loop for the count of the first primary component.
    for (let countA = 0; countA * 100 * baseUnitAmount <= totalBudget; countA++) {
      // Loop for the count of the second primary component.
      for (let countB = 0; countA * 100 * baseUnitAmount + countB * 100 * secondUnitAmount <= totalBudget; countB++) {
        // Loop for the count of the first additive component.
        for (let countC = 0; countA * 100 * baseUnitAmount + countB * 100 * secondUnitAmount + countC * firstAdditiveAmount <= totalBudget; countC++) {
          // Loop for the count of the second additive component.
          for (let countD = 0; countA * 100 * baseUnitAmount + countB * 100 * secondUnitAmount + countC * firstAdditiveAmount + countD * secondAdditiveAmount <= totalBudget; countD++) {

            // Calculate the current quantity of additive parts and base parts.
            const currentAdditivePart = countC * firstAdditiveAmount + countD * secondAdditiveAmount;
            const currentBasePart = countA * 100 * baseUnitAmount + countB * 100 * secondUnitAmount;

            // Check if the current additive quantity satisfies a given ratio condition relative to the base quantity.
            if (currentAdditivePart <= currentBasePart * ratioMultiplier) {
              // Calculate the current total quantity.
              const currentTotalQuantity = currentBasePart + currentAdditivePart;

              // Skip calculations if the total quantity is zero to avoid division by zero.
              if (currentTotalQuantity === 0) {
                continue;
              }

              // Calculate the current concentration (ratio of additive part to total quantity).
              const currentConcentration = (100 * currentAdditivePart) / currentTotalQuantity;

              // If the current concentration is higher than the previously found maximum, update the optimal values.
              if (currentConcentration > maxConcentration) {
                maxConcentration = currentConcentration;         // Update the highest concentration ratio.
                optimalTotalQuantity = currentTotalQuantity;     // Update the total quantity for this optimal ratio.
                optimalAdditiveQuantity = currentAdditivePart;   // Update the additive quantity for this optimal ratio.
              }
            }
          }
        }
      }
    }
  }
  // Output the final optimal total quantity and optimal additive quantity to the console.
  console.log('%s %d', optimalTotalQuantity, optimalAdditiveQuantity);
}

// Read input from the standard input stream using Node.js file system module,
// and then invoke the main processing function with the read data.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));