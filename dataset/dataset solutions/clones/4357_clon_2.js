function SolutionProcessor(rawInputData) {
    // Helper function for ascending numerical sort
    function numericalSortAsc(valA, valB) {
        return valA - valB;
    }

    // Process the raw input string: trim, split by newline, then split each line by space.
    rawInputData = rawInputData.trim().split("\n").map(function(lineItem) {
        return lineItem.split(" ");
    });

    // Parse the first line of input into integer parameters.
    const initialParams = rawInputData[0].map(paramStr => parseInt(paramStr, 10));

    // Assign parameters to descriptive variables, converting water units to grams (x100).
    const waterGranuleA = initialParams[0] * 100; // Weight of water unit A in grams
    const waterGranuleB = initialParams[1] * 100; // Weight of water unit B in grams
    const sugarGranuleC = initialParams[2];       // Weight of sugar unit C in grams
    const sugarGranuleD = initialParams[3];       // Weight of sugar unit D in grams
    const maxSolubilityPercentage = initialParams[4]; // Maximum sugar solubility ratio (E)
    const totalMaxWeight = initialParams[5];      // Maximum total weight of solution (F)

    // --- Calculate all possible water amounts ---
    // Generate combinations of water using waterGranuleA and waterGranuleB,
    // ensuring total weight does not exceed totalMaxWeight.
    let possibleWaterAmounts = [];
    let currentWaterSum; // Temporary variable to hold current water amount
    for (let idxA = 0; idxA * waterGranuleA <= totalMaxWeight; idxA++) {
        currentWaterSum = waterGranuleA * idxA;
        for (let idxB = 0; currentWaterSum + idxB * waterGranuleB <= totalMaxWeight; idxB++) {
            possibleWaterAmounts.push(currentWaterSum + waterGranuleB * idxB);
        }
    }

    // Sort the water amounts and remove duplicates.
    possibleWaterAmounts.sort(numericalSortAsc);
    possibleWaterAmounts = possibleWaterAmounts.filter(function (uniqueItem, idx, arrayReference) {
        return arrayReference.indexOf(uniqueItem) === idx;
    });

    // --- Calculate maximum allowed sugar weight ---
    // The maximum sugar that can be dissolved is limited by the solubility ratio E
    // and the total maximum weight F.
    const maxAllowedSugarWeight = Math.floor(totalMaxWeight * maxSolubilityPercentage / (100 + maxSolubilityPercentage));

    // --- Calculate all possible sugar amounts ---
    // Generate combinations of sugar using sugarGranuleC and sugarGranuleD,
    // ensuring total sugar weight does not exceed maxAllowedSugarWeight.
    let possibleSugarAmounts = [];
    let currentSugarSum; // Temporary variable to hold current sugar amount
    for (let idxA = 0; idxA * sugarGranuleC <= maxAllowedSugarWeight; idxA++) {
        currentSugarSum = sugarGranuleC * idxA;
        for (let idxB = 0; currentSugarSum + idxB * sugarGranuleD <= maxAllowedSugarWeight; idxB++) {
            possibleSugarAmounts.push(currentSugarSum + sugarGranuleD * idxB);
        }
    }

    // Sort the sugar amounts and remove duplicates.
    possibleSugarAmounts.sort(numericalSortAsc);
    possibleSugarAmounts = possibleSugarAmounts.filter(function (uniqueItem, idx, arrayReference) {
        return arrayReference.indexOf(uniqueItem) === idx;
    });

    // --- Create a bitmap for quick lookup of possible sugar amounts ---
    // This optimizes checking if a specific sugar amount is achievable.
    let sugarAvailabilityMap = [];
    for (let idxA = 0; idxA <= maxAllowedSugarWeight; idxA++) {
        sugarAvailabilityMap.push(0); // Initialize all entries to 0 (not available)
    }
    for (const sugarVal of possibleSugarAmounts) {
        sugarAvailabilityMap[sugarVal] = 1; // Mark available sugar amounts with 1
    }

    // --- Find the optimal solution ---
    // Iterate through possible water amounts and then possible sugar amounts
    // to find the highest density solution within constraints.
    let highestDensityFound = 0; // Stores the maximum sugar density (sugar / water)
    let optimalSolution = [0, 0]; // Stores [total_weight, sugar_weight] for the optimal solution

    let currentSugarLowerBound; // Lower bound for sugar amount based on current density
    let currentSugarUpperBound = maxAllowedSugarWeight; // Upper bound for sugar amount

    // Iterate over each possible water amount.
    for (const waterVal of possibleWaterAmounts) {
        // Calculate the lower bound for sugar based on the current highest density found.
        // This prunes the search space.
        currentSugarLowerBound = Math.floor(waterVal * highestDensityFound);
        
        // Calculate the upper bound for sugar, considering solubility and total weight limits.
        currentSugarUpperBound = Math.min(
            Math.floor(waterVal * maxSolubilityPercentage / 100), // Solubility limit
            totalMaxWeight - waterVal                             // Total weight limit
        );

        // Iterate through possible sugar amounts within the calculated bounds.
        for (let sugarCheckVal = currentSugarLowerBound; sugarCheckVal <= currentSugarUpperBound; sugarCheckVal++) {
            // Check if this sugar amount is achievable (present in the bitmap)
            if (sugarAvailabilityMap[sugarCheckVal] === 1) {
                // If a higher density is found, update the optimal solution.
                if ((sugarCheckVal / waterVal) > highestDensityFound) {
                    optimalSolution[0] = waterVal + sugarCheckVal; // Total weight
                    optimalSolution[1] = sugarCheckVal;            // Sugar weight
                    highestDensityFound = sugarCheckVal / waterVal; // Update max density
                }
                // Mark this sugar amount as "used" or "checked" to avoid redundant calculations
                // if multiple water amounts could lead to the same sugar amount.
                // This is a crucial optimization to prevent re-evaluating the same sugar amount
                // with different water amounts if it doesn't improve density.
                sugarAvailabilityMap[sugarCheckVal] = 0; 
            }
        }
    }

    // Output the optimal total weight and sugar weight.
    console.log("%d %d", optimalSolution[0], optimalSolution[1]);
}

// Read input from standard input and pass it to the main processing function.
SolutionProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
