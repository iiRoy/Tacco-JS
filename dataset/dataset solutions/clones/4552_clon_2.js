function ProcessData(rawDataString) {
    // Split the entire input string by newline characters to get individual lines.
    rawDataString = rawDataString.split('\n');

    // Process the very first line to extract configuration values.
    const firstConfigTokens = rawDataString[0].split(' ');
    
    // Parse the total number of entities from the first token.
    const totalEntities = parseInt(firstConfigTokens[0]);
    
    // Parse the high attack value from the second token.
    const highAttackValue = parseInt(firstConfigTokens[1]);
    
    // Parse the low attack value from the third token.
    const lowAttackValue = parseInt(firstConfigTokens[2]);

    // Initialize variables to track the highest health found among entities.
    let greatestHealth = 0;
    let greatestIndex = 0;

    // Create an array to store the health levels of all foes.
    const foeHealthLevels = [];
    
    // Unused variable, but renamed for consistency.
    let eliminationCounter = 0;
    
    // Variable to hold the ultimate calculated answer.
    let finalSolution = 0;
    
    // Loop through the input lines to populate foe healths and find the maximum.
    for (let entityIdx = 0; entityIdx < totalEntities; entityIdx++) {
        foeHealthLevels[entityIdx] = parseInt(rawDataString[entityIdx + 1]);
        
        // Check if the current foe has a higher health than the current greatest.
        if (foeHealthLevels[entityIdx] > greatestHealth) {
            greatestHealth = foeHealthLevels[entityIdx];
            greatestIndex = entityIdx;
        }
    }
    
    // This line was commented out in the original, keeping it that way.
    // console.log(greatestHealth + " " + greatestIndex);

    // Initialize bounds for a binary search-like operation.
    let searchUpperLimit = Math.ceil(greatestHealth / (lowAttackValue));
    let searchLowerLimit = 0;
    
    // A temporary variable for swapping values during the search.
    let temporaryHold = 0;
    
    // Set an initial estimate for the final solution.
    finalSolution = Math.ceil(greatestHealth / (2 * lowAttackValue));
    
    // Calculate an initial base damage value.
    let calculatedBaseDmg = finalSolution * lowAttackValue;
    
    // Counter for the number of iterations performed.
    let iterationStep = 0;
    
    // Variable to accumulate additional efforts required.
    let additionalEffort = 0;
    
    // Begin an infinite loop for the binary search process.
    while (true) {
        // Increment the iteration counter.
        iterationStep++;
        
        // Recalculate the base damage for the current finalSolution estimate.
        calculatedBaseDmg = finalSolution * lowAttackValue;
        
        // Iterate through all foe health levels to determine additional effort needed.
        for (let entityIdx = 0; entityIdx < totalEntities; entityIdx++) {
            // If a foe's health exceeds the base damage, calculate the extra attacks needed.
            if (foeHealthLevels[entityIdx] > calculatedBaseDmg) {
                additionalEffort += Math.ceil((foeHealthLevels[entityIdx] - calculatedBaseDmg) / (highAttackValue - lowAttackValue));
            }
        }

        // Adjust search bounds based on whether additional effort is more, less, or equal to the current solution.
        if (additionalEffort > finalSolution) {
            temporaryHold = finalSolution;
            finalSolution = Math.ceil((searchUpperLimit + finalSolution) / 2);
            searchLowerLimit = temporaryHold;
        } 
        else if (additionalEffort < finalSolution) {
            temporaryHold = finalSolution;
            finalSolution = Math.ceil((searchLowerLimit + finalSolution) / 2);
            searchUpperLimit = temporaryHold;
        } 
        else {
            // If additional effort equals the solution, we've found the optimal value.
            break; 
        }
        
        // This debug line was commented out in the original.
        // console.log("Upper Limit: " + searchUpperLimit + " Lower Limit: " + searchLowerLimit + " Result: " + finalSolution + " Extra Effort: " + additionalEffort);
        
        // Reset additional effort for the next iteration.
        additionalEffort = 0;
    }

    // Output the final calculated solution.
    console.log(finalSolution);
}

// Call the main processing function with input read from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));