// This module handles reading input from the system's standard input.
let sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is parsed into three numerical parameters after trimming whitespace
// and splitting by spaces. These parameters are assigned to distinct variables.
let [alphaFactor, betaOffset, gammaTotal] = sourceData.trim().split(" ").map(Number);

// An initial calculation determines the number of cycles required based on the total value
// and a primary scaling factor. The ceiling function ensures whole cycles.
let cycleCount = Math.ceil(gammaTotal / alphaFactor);

// A variable is initialized to accumulate results from iterative processes.
let cumulativeResult = 0;

// This loop continues as long as the current cycle count exceeds a specific threshold value (6).
while (cycleCount > 6) {
    // In each iteration, the cumulative result is incremented by a fixed constant (7).
    cumulativeResult = cumulativeResult + 7;
    
    // The total value is then reduced by a combination of a fixed offset and a scaled factor,
    // reflecting resources consumed or progress made during the iteration.
    gammaTotal = gammaTotal - (betaOffset + 7 * alphaFactor);
    
    // The cycle count is re-evaluated with the updated total value to determine if further iterations are needed.
    cycleCount = Math.ceil(gammaTotal / alphaFactor);
}

// Finally, the program outputs the sum of the accumulated result and any remaining partial cycle count.
// If the final cycle count is non-positive, it defaults to zero to avoid negative contributions.
console.log(cumulativeResult + (cycleCount > 0 ? cycleCount : 0));