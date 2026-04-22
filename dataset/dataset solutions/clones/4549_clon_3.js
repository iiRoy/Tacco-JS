// This function processes game-related data to simulate a turn-based elimination process.
// It takes raw input as a string, typically from standard input.
function ProcessGameData(rawDataStream) {
  // First, split the entire input string into individual lines,
  // trimming any leading/trailing whitespace from the whole stream for robustness.
  const inputLines = rawDataStream.trim().split("\n");

  // Parse the initial game parameters from the first line of input.
  // These parameters define the number of entities and damage values.
  const gameConfigParams = inputLines[0].split(" ");
  const initialEntityCount = parseInt(gameConfigParams[0], 10); // N: Total entities at start.
  const damageToHighest = parseInt(gameConfigParams[1], 10);    // A: Damage applied to the strongest entity.
  const damageToOthers = parseInt(gameConfigParams[2], 10);     // B: Damage applied to all other entities.

  // Initialize an array to store the current 'health' or 'strength' of each entity.
  // Using a modern `const` and array literal for initialization.
  const entityStrengths = [];

  // Populate the entityStrengths array using the subsequent lines of input.
  // Each line after the first contains an entity's initial strength value.
  for (let entityCreationIndex = 0; entityCreationIndex < initialEntityCount; entityCreationIndex++) {
    entityStrengths.push(parseInt(inputLines[entityCreationIndex + 1], 10));
  }

  // Initialize a counter to track the number of game turns that have passed.
  let elapsedGameTurns = 0;

  // The main game simulation loop continues as long as there are entities remaining
  // and at least one entity still has a positive strength value.
  // This condition explicitly handles cases where the array might become empty or all strengths are non-positive.
  while (entityStrengths.length > 0 && Math.max(...entityStrengths) > 0) {
    // Increment the turn counter at the beginning of each new turn.
    elapsedGameTurns++;

    // Determine the maximum strength value among all currently active entities.
    const currentMaxStrengthValue = Math.max(...entityStrengths);

    // Find the index of the entity possessing the highest strength.
    // `indexOf` returns the first occurrence if multiple entities share the max strength.
    const indexOfStrongestEntity = entityStrengths.indexOf(currentMaxStrengthValue);

    // Iterate through the entities in reverse order.
    // This approach is critical when elements might be removed from the array
    // using `splice`, as it prevents issues with shifted indices.
    for (let scanIndex = entityStrengths.length - 1; scanIndex >= 0; scanIndex--) {
      // Check if the current entity being scanned is the one identified as the strongest.
      if (scanIndex === indexOfStrongestEntity) {
        // Apply the special, higher damage amount to the strongest entity.
        entityStrengths[scanIndex] -= damageToHighest;
      } else {
        // Apply the standard damage amount to all other entities.
        entityStrengths[scanIndex] -= damageToOthers;

        // After applying damage, check if the entity's strength has fallen to zero or below.
        // If so, the entity is considered eliminated and is removed from the game.
        const isEntityEliminated = entityStrengths[scanIndex] <= 0;
        if (isEntityEliminated) {
          entityStrengths.splice(scanIndex, 1);
        }
      }
    }
  }

  // Once the loop concludes (all entities are eliminated or have non-positive strength),
  // output the total number of turns that were required.
  // Using a template literal for modern string output.
  console.log(`${elapsedGameTurns}`);
}

// Entry point for execution: Read input from standard input and pass it to the processing function.
// `require("fs").readFileSync` is used for synchronous file reading, common in competitive programming environments.
ProcessGameData(require("fs").readFileSync("/dev/stdin", "utf8"));