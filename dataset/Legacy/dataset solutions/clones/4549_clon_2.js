function ProcessInput(rawData) {
  // Split the raw input string into an array of lines for easier processing.
  let processedLines = rawData.split("\n");

  // Extract initial game parameters from the first line of input.
  // 'entityCount' represents the total number of entities in the game.
  let entityCount = parseInt(processedLines[0].split(" ")[0]);
  // 'primaryAttackPower' is the damage dealt to the strongest entity.
  let primaryAttackPower = parseInt(processedLines[0].split(" ")[1]);
  // 'secondaryAttackPower' is the damage dealt to all other entities.
  let secondaryAttackPower = parseInt(processedLines[0].split(" ")[2]);

  // Initialize an array to hold the current health points of all entities.
  let entityHealths = new Array();
  // This variable is declared but not utilized in the original logic.
  let unusedVariable = 0;

  // Populate the 'entityHealths' array with values from the subsequent input lines.
  // Each line after the first contains the health of an individual entity.
  for (let iterationCounter = 0; iterationCounter < entityCount; iterationCounter++) {
    entityHealths[iterationCounter] = parseInt(processedLines[iterationCounter + 1]);
  }

  // Initialize a counter to track the number of attack rounds completed.
  let attackRounds = 0;

  // The main battle loop continues as long as there is at least one entity with non-negative health.
  // Math.max.apply(null, entityHealths) finds the highest health value among remaining entities.
  for (let iterationCounter = 0; Math.max.apply(null, entityHealths) >= 0; iterationCounter++) {
    // Determine the index of the entity currently possessing the highest health.
    let strongestEntityIndex = entityHealths.indexOf(Math.max.apply(null, entityHealths));

    // Iterate through the entities in reverse order. This approach is safe when removing elements
    // from an array using 'splice', as it prevents issues with shifting indices.
    for (let currentEntityIdx = entityHealths.length - 1; currentEntityIdx >= 0; currentEntityIdx--) {
      // Apply damage based on whether the current entity is the strongest or not.
      if (currentEntityIdx === strongestEntityIndex) {
        // The strongest entity takes 'primaryAttackPower' damage.
        entityHealths[currentEntityIdx] -= primaryAttackPower;
      } else {
        // All other entities take 'secondaryAttackPower' damage.
        entityHealths[currentEntityIdx] -= secondaryAttackPower;
        // If an entity's health drops to zero or below, it is removed from the game.
        if (entityHealths[currentEntityIdx] <= 0) {
          entityHealths.splice(currentEntityIdx, 1);
        }
      }
    }
    // Increment the round counter after all entities have been processed for the current round.
    attackRounds++;
  }

  // Output the final count of attack rounds required to defeat all entities.
  console.log('%s', attackRounds);
}

// Read the entire input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
