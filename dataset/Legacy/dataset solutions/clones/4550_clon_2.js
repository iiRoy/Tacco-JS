function ProcessInput(rawData) {
    // The input string is split into an array of lines.
    rawData = rawData.split("\n");

    // The first line contains three space-separated integers.
    var firstLineParts = rawData[0].split(" ");
    var entityCount = parseInt(firstLineParts[0]); // Represents 'num' from original
    var highDamage = parseInt(firstLineParts[1]);  // Represents 'hi' from original
    var lowDamage = parseInt(firstLineParts[2]);   // Represents 'lo' from original

    // Variables to track the maximum health found among entities and its index.
    var peakHealth = 0;
    var peakIndex = 0;

    // An array to store the health points of each enemy entity.
    var enemyHealths = [];

    // This variable 'eliminationCount' is declared but not utilized in the current logic.
    var eliminationCount = 0;

    // 'finalResult' will store the computed minimum number of attacks.
    var finalResult = 0;

    // Iterate through the input lines to populate the enemy healths array
    // and simultaneously identify the entity with the highest health.
    for (var idx = 0; idx < entityCount; idx++) {
        enemyHealths[idx] = parseInt(rawData[idx + 0x1]); // Parse health from subsequent lines
        // Check if the current entity's health is greater than the previously recorded peak.
        if (enemyHealths[idx] > peakHealth) {
            peakHealth = enemyHealths[idx]; // Update the maximum health.
            peakIndex = idx;                // Store the index of this entity.
        }
    }

    // Original debug line, kept commented out to preserve behavior.
    // console.log(peakHealth + " " + peakIndex);

    // Initialize bounds for a binary search-like approach to find the optimal 'finalResult'.
    var upperBound = Math.ceil(peakHealth / (lowDamage));
    var lowerBound = 0;
    var temporaryValue = 0;

    // Initial estimation for 'finalResult'.
    finalResult = Math.ceil(peakHealth / (0x2 * lowDamage)); // Using 0x2 for the literal 2

    var baseAttackPower = finalResult * lowDamage;
    var iterationCounter = 0; // Counter to prevent infinite loops.
    var additionalAttacks = 0; // Accumulator for extra attacks required.

    // Main loop to refine 'finalResult'. It continues until a break condition is met.
    while (0b1) { // Using 0b1 for the literal 1 (true)
        iterationCounter++; // Increment the loop counter.
        baseAttackPower = finalResult * lowDamage; // Calculate base damage for the current 'finalResult'.
        additionalAttacks = 0; // Reset additional attacks for this iteration.

        // Loop through all enemies to calculate how many additional attacks are needed.
        for (var idx = 0; idx < entityCount; idx++) {
            if (enemyHealths[idx] > baseAttackPower) {
                // If an enemy's health exceeds the base damage, calculate the extra attacks.
                additionalAttacks += Math.ceil((enemyHealths[idx] - baseAttackPower) / (highDamage - lowDamage));
            }
        }

        // Original debug line, kept commented out.
        // console.log("upperBound:" + upperBound + " lowerBound:" + lowerBound + " finalResult:" + finalResult + " additionalAttacks:" + additionalAttacks + " temporaryValue:" + temporaryValue);

        // Adjust the search bounds based on the comparison of 'additionalAttacks' and 'finalResult'.
        if (additionalAttacks > finalResult) {
            temporaryValue = finalResult;
            finalResult = Math.ceil((upperBound + finalResult) / 0x2); // Using 0x2 for the literal 2
            lowerBound = temporaryValue;
        } else if (additionalAttacks < finalResult) {
            temporaryValue = finalResult;
            finalResult = Math.ceil((lowerBound + finalResult) / 0x2); // Using 0x2 for the literal 2
            upperBound = temporaryValue;
        } else {
            // If 'additionalAttacks' equals 'finalResult', the optimal value is found.
            break;
        }

        // Check for convergence: if 'finalResult' stops changing, break the loop.
        if (finalResult === temporaryValue) {
            break;
        }

        // Safety break: if the loop runs too many times, exit to prevent infinite execution.
        if (iterationCounter > 0x64) { // Using 0x64 for the literal 100
            break;
        }
        additionalAttacks = 0; // Reset for the next iteration.
    }

    // Output the final calculated result to the console.
    console.log(finalResult);
}

// Read input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
