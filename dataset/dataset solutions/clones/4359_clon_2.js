function ProcessInput(rawData) {
    // Helper function for numerical sorting in ascending order
    function numericSorter(valA, valB) {
        return valA - valB;
    }

    // Parse the raw input data: trim, split by newlines, then split each line by spaces
    rawData = rawData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Extract and convert the first line's parameters to integers
    const firstLineValues = rawData[0].map(element => parseInt(element, 10));

    // Assign problem constraints with descriptive names for clarity
    const sugarWaterUnitA = firstLineValues[0] * 100; // Water unit A in grams (multiplied by 100 for consistency)
    const sugarWaterUnitB = firstLineValues[1] * 100; // Water unit B in grams (multiplied by 100 for consistency)
    const sugarUnitC = firstLineValues[2];             // Sugar unit C in grams
    const sugarUnitD = firstLineValues[3];             // Sugar unit D in grams
    const maxSugarRatio = firstLineValues[4];          // Maximum sugar ratio (E) as a percentage
    const maxTotalWeight = firstLineValues[5];         // Maximum total weight (F) in grams

    // Generate all possible water amounts (A*i + B*j) that can be formed
    let waterSugarMixtures = [];
    let currentWaterAmount; // Temporary variable to hold the calculated water amount

    // Iterate through possible combinations of water units A and B
    for (let idxA = 0; idxA < (maxTotalWeight / sugarWaterUnitA); idxA++) {
        currentWaterAmount = sugarWaterUnitA * idxA;
        for (let idxB = 0; idxB < ((maxTotalWeight - currentWaterAmount) / sugarWaterUnitB); idxB++) {
            waterSugarMixtures.push(currentWaterAmount + sugarWaterUnitB * idxB);
        }
    }

    // Sort the generated water amounts numerically and remove duplicates
    waterSugarMixtures.sort(numericSorter);
    waterSugarMixtures = waterSugarMixtures.filter(function(elementValue, index, uniqueElements) {
        return uniqueElements.indexOf(elementValue) === index;
    });

    // Calculate the maximum allowed sugar weight based on the total weight and max sugar ratio
    const maxAllowedSugarWeight = Math.floor(maxTotalWeight * maxSugarRatio / (100 + maxSugarRatio));

    // Generate all possible sugar amounts (C*i + D*j) that can be formed
    let sugarOnlyMixtures = [];
    let currentSugarAmount; // Temporary variable to hold the calculated sugar amount

    // Iterate through possible combinations of sugar units C and D
    for (let idxC = 0; idxC < (maxAllowedSugarWeight / sugarUnitC); idxC++) {
        currentSugarAmount = sugarUnitC * idxC;
        for (let idxD = 0; idxD < ((maxAllowedSugarWeight - currentSugarAmount) / sugarUnitD); idxD++) {
            sugarOnlyMixtures.push(currentSugarAmount + sugarUnitD * idxD);
        }
    }

    // Sort the generated sugar amounts numerically and remove duplicates
    sugarOnlyMixtures.sort(numericSorter);
    sugarOnlyMixtures = sugarOnlyMixtures.filter(function(elementValue, index, uniqueElements) {
        return uniqueElements.indexOf(elementValue) === index;
    });

    // Create a bitmap (boolean array) for efficient lookup of valid sugar amounts
    const sugarPresenceMap = [];
    // Initialize the map with zeros up to the maximum allowed sugar weight
    for (let mapIndex = 0; mapIndex <= maxAllowedSugarWeight; mapIndex++) {
        sugarPresenceMap.push(0);
    }
    // Mark all generated sugar amounts as present (1) in the map
    for (const sugarVal of sugarOnlyMixtures) {
        sugarPresenceMap[sugarVal] = 1;
    }

    // Variables to track the best solution found (maximum density)
    let currentMaxDensity;
    let lowerSugarBound;
    let upperSugarBound;
    let bestSolution = [0, 0]; // Stores [totalWeight, sugarWeight] of the best solution

    currentMaxDensity = 0; // Initialize maximum density to 0

    // Iterate through each possible water amount
    for (const waterMixWeight of waterSugarMixtures) {
        // Calculate the lower and upper bounds for sugar weight for the current water amount
        lowerSugarBound = Math.round(waterMixWeight * currentMaxDensity); // Start checking from current best density
        upperSugarBound = Math.min(
            Math.floor(waterMixWeight * maxSugarRatio / 100), // Max sugar based on ratio E
            maxTotalWeight - waterMixWeight                   // Max sugar based on total weight F
        );

        // Iterate through possible sugar amounts within the calculated bounds
        for (let sugarMixWeight = lowerSugarBound; sugarMixWeight <= upperSugarBound; sugarMixWeight++) {
            // Check if this sugar amount is valid (present in the bitmap)
            if (sugarPresenceMap[sugarMixWeight] === 1) {
                // If a higher density is found, update the best solution
                if ((sugarMixWeight / waterMixWeight) > currentMaxDensity) {
                    bestSolution[0] = waterMixWeight + sugarMixWeight; // Total weight
                    bestSolution[1] = sugarMixWeight;                  // Sugar weight
                    currentMaxDensity = sugarMixWeight / waterMixWeight; // Update max density
                }
                // Mark this sugar amount as "used" by setting its bitmap entry to 0.
                // This prevents it from being considered again with any subsequent water amounts,
                // which is a specific optimization/behavior of the original algorithm.
                sugarPresenceMap[sugarMixWeight] = 0;
            }
        }
    }

    // Output the final result, rounding the total weight and sugar weight
    console.log("%d %d", Math.round(bestSolution[0]), Math.round(bestSolution[1]));
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
