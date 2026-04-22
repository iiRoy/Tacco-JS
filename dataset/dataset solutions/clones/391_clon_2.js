const rawData = require('fs') .readFileSync('/dev/stdin', 'utf8');

let numericInputs = rawData
  .trim()
  .split("\n")
  .map(Number);

// Begin main processing sequence, iterating through provided datasets
while (true) {
    // Retrieve the next modulus value from the collection
    let currentModulo = numericInputs.shift();

    // Check if the termination value (zero) has been encountered
    if (currentModulo === 0) {
        break; // Exit the endless loop if processing is complete
    }

    // Initialize an array to store boolean flags for positions
    let markFlags = [];

    // Populate the flag array, setting all initial values to false
    for (let indexVar = 0; indexVar < currentModulo; indexVar++) {
        markFlags[indexVar] = false;
    }

    // Mark positions that correspond to perfect squares modulo the current modulus
    for (let indexVar = 1; indexVar < currentModulo; indexVar++) {
        markFlags[(indexVar * indexVar) % currentModulo] = true;
    }

    // Collect all indices where the boolean flag is true
    let squarePositions = [];
    markFlags.forEach(function (isMarked, position) {
        if (isMarked) {
            squarePositions.push(position); // Add the index to our list of marked squares
        }
    });

    // Prepare an array to accumulate the final result counts
    let tallyResults = [];
    const halfSize = (currentModulo - 1) / 2; // Determine the effective upper bound for differences

    // Initialize the result array with zero counts up to the calculated half-size
    for (let indexVar = 0; indexVar <= halfSize; indexVar++) {
        tallyResults[indexVar] = 0;
    }

    // Calculate pairwise differences between all collected square positions
    for (let indexVar = 0; indexVar < squarePositions.length; indexVar++) {
        for (let secondIndex = indexVar + 1; secondIndex < squarePositions.length; secondIndex++) {
            // Compute the absolute difference, considering modular arithmetic
            let calcDiff = squarePositions[indexVar] - squarePositions[secondIndex];

            // Normalize negative differences by adding the modulus
            if (calcDiff < 0) {
                calcDiff += currentModulo;
            }

            // Map larger differences to their symmetric counterparts
            if (halfSize < calcDiff) {
                calcDiff = currentModulo - calcDiff;
            }

            // Increment the tally for the specific difference by two
            tallyResults[calcDiff] += 2;
        }
    }

    // Discard the count for the zero difference (often irrelevant in these problems)
    tallyResults.shift();

    // Print each calculated tally to the standard output
    tallyResults.forEach(function (currentCount) {
        console.log(currentCount);
    });
}