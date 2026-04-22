function parseNumericValue(valueStr, defaultValue = 0, errorContext = 'a numeric value') {
    const parsedNumber = parseInt(valueStr, 10);
    if (isNaN(parsedNumber)) {
        // In a production environment, this might throw an error or be logged.
        // For competitive programming, we assume valid input, but this adds robustness.
        console.warn(`Warning: Could not parse '${valueStr}' as ${errorContext}. Using default value: ${defaultValue}`);
        return defaultValue;
    }
    return parsedNumber;
}

/**
 * Processes battle campaign data to calculate the total number of monsters vanquished.
 * This function simulates heroes moving through towns, defeating monsters in adjacent locations.
 * @param {string} campaignDataString - The raw input string containing battle parameters.
 */
function processCampaignResults(campaignDataString) {
    // Split the entire input string into individual lines for structured access.
    const campaignLines = campaignDataString.split('\n');

    // The first line typically contains a count 'N', but its direct value is often not needed
    // if array lengths are determined dynamically. We'll skip parsing it as it's not used
    // in the subsequent core logic after array initialization.
    // const initialTownCount = parseNumericValue(campaignLines[0], 0, 'initial town count');

    // Parse the second line to get the initial monster counts for each town.
    // This array represents the current state of monsters and will be modified by heroes.
    let currentTownMonsterLevels = campaignLines[1].split(' ').map(str =>
        parseNumericValue(str, 0, `monster count for town: '${str}'`)
    );

    // Parse the third line to get the combat power of each hero.
    // Each hero's power is applied to adjacent towns in their sequence.
    const heroCombatPowers = campaignLines[2].split(' ').map(str =>
        parseNumericValue(str, 0, `hero combat power: '${str}'`)
    );

    // Initialize the cumulative score, which tracks the total number of monsters defeated.
    let totalMonstersVanished = 0;

    // Iterate through each hero to simulate their battle sequence.
    // Each hero (identified by 'heroSequenceIndex') first battles in town 'i'
    // and then uses any remaining strength in town 'i+1'.
    for (let heroSequenceIndex = 0; heroSequenceIndex < heroCombatPowers.length; heroSequenceIndex++) {
        // Retrieve the current hero's strength for this battle segment.
        const activeHeroStrength = heroCombatPowers[heroSequenceIndex];

        // Determine the monster counts for the two towns this hero will interact with.
        // 'monstersInCurrentTown' refers to town 'heroSequenceIndex'.
        let monstersInCurrentTown = currentTownMonsterLevels[heroSequenceIndex];
        
        // 'monstersInNextTown' refers to town 'heroSequenceIndex + 1'.
        // If 'heroSequenceIndex + 1' is out of bounds (i.e., it's the last hero),
        // we treat the monster count in the non-existent next town as zero.
        let monstersInNextTown = currentTownMonsterLevels[heroSequenceIndex + 1] || 0;

        // --- Simulate the hero's battle in the current town (Town 'i') ---

        // Calculate how many monsters the hero can defeat in the current town.
        // This is limited by either the hero's strength or the available monsters.
        const defeatedInCurrentTown = Math.min(activeHeroStrength, monstersInCurrentTown);
        totalMonstersVanished += defeatedInCurrentTown; // Add to the total score.

        // Determine the hero's remaining combat power after fighting in the current town.
        let remainingHeroPower = activeHeroStrength - defeatedInCurrentTown;

        // --- Simulate the hero's battle in the next town (Town 'i+1') ---

        // Calculate how many monsters the hero can defeat in the next town.
        // This is limited by the hero's remaining power or the monsters in the next town.
        const defeatedInNextTown = Math.min(remainingHeroPower, monstersInNextTown);
        totalMonstersVanished += defeatedInNextTown; // Add to the total score.

        // Update the monster count for the next town in the 'currentTownMonsterLevels' array.
        // This modification is persistent and affects subsequent heroes who might battle in this town.
        // The monster count in the current town ('heroSequenceIndex') is not explicitly updated
        // in the array because it's considered fully processed by this hero and will not be
        // revisited as a 'current town' by subsequent heroes.
        currentTownMonsterLevels[heroSequenceIndex + 1] = monstersInNextTown - defeatedInNextTown;
    }

    // After all heroes have completed their battles, log the final accumulated score.
    console.log(totalMonstersVanished);
}

// Standard entry point for competitive programming in Node.js:
// Read the entire file content from standard input and pass it to the processing function.
processCampaignResults(require("fs").readFileSync("/dev/stdin", "utf8"));