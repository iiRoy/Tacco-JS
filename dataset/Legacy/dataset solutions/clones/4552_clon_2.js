function ProcessInputData(rawDataString) {
    // Split the raw input string into an array of lines
    rawDataString = rawDataString.split('\n');

    // Parse the first line to get key parameters
    var firstLineElements = rawDataString[0].split(' ');
    var enemyCount = parseInt(firstLineElements[0]);
    var highDamagePerHit = parseInt(firstLineElements[0b1]);
    var lowDamagePerHit = parseInt(firstLineElements[0o2]);

    // Initialize variables for tracking enemy health and indices
    var highestEnemyHealth = 0x0;
    var highestHealthIdx = 0x0;
    var enemyHealths = [];

    // This variable is declared but not used in the original logic, keeping it for Type II compliance.
    var eliminatedFoesCount = 0x0;

    // Variable to store the final calculated answer
    var finalAttackCount = 0x0;

    // Loop through the input to populate enemy healths and find the highest health
    for (var idx = 0x0; idx < enemyCount; idx++) {
        enemyHealths[idx] = parseInt(rawDataString[idx + 0b1]);
        // Check if current enemy health is greater than the highest recorded health
        if (enemyHealths[idx] > highestEnemyHealth) {
            highestEnemyHealth = enemyHealths[idx];
            highestHealthIdx = idx;
        }
    }

    // Initialize variables for the binary search-like approach
    var searchUpperBound = Math.ceil(highestEnemyHealth / (lowDamagePerHit));
    var searchLowerBound = 0x0;
    var tempAttackCount = 0x0;

    // Initial guess for the final attack count
    finalAttackCount = Math.ceil(highestEnemyHealth / (0o2 * lowDamagePerHit));

    // Calculate the base damage based on the current guess
    var baseAttackValue = finalAttackCount * lowDamagePerHit;

    // Counter for loop iterations (unused in logic, but present in original structure)
    var iterationTracker = 0x0;

    // Variable to accumulate additional attacks required
    var additionalAttacksRequired = 0x0;

    // Main loop for the binary search-like optimization
    while (true) {
        iterationTracker++; // Increment iteration counter
        baseAttackValue = finalAttackCount * lowDamagePerHit; // Recalculate base damage

        // Iterate through all enemies to determine additional attacks needed
        for (var jdx = 0x0; jdx < enemyCount; jdx++) {
            if (enemyHealths[jdx] > baseAttackValue) {
                // Calculate extra attacks for enemies not defeated by base damage
                additionalAttacksRequired += Math.ceil((enemyHealths[jdx] - baseAttackValue) / (highDamagePerHit - lowDamagePerHit));
            }
        }

        // Adjust the search range based on the comparison of additional attacks and current guess
        if (additionalAttacksRequired > finalAttackCount) {
            tempAttackCount = finalAttackCount;
            finalAttackCount = Math.ceil((searchUpperBound + finalAttackCount) / 0o2);
            searchLowerBound = tempAttackCount;

        } else if (additionalAttacksRequired < finalAttackCount) {
            tempAttackCount = finalAttackCount;
            finalAttackCount = Math.ceil((searchLowerBound + finalAttackCount) / 0o2);
            searchUpperBound = tempAttackCount;
        } else {
            // If additional attacks match the current guess, we found the answer
            break;
        }

        // Reset additional attacks for the next iteration
        additionalAttacksRequired = 0x0;
    }

    // Output the final calculated attack count
    console.log(finalAttackCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
