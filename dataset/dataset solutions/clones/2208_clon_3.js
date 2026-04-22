const processBattleScenario = (scenarioLines) => {
  // Initial parsing of scenario parameters from the first line
  // Using destructuring and map to convert string parts to numbers
  const [initialMonsterCountStr, attackRadiusStr, bombDamageStr] = scenarioLines[0].split(" ");
  const initialMonsterCount = Number(initialMonsterCountStr);
  const attackRadius = Number(attackRadiusStr);
  const bombDamage = Number(bombDamageStr);

  // Validate critical parameters (Type III: add guard clauses/validations)
  // Ensures basic input integrity for the simulation
  if (initialMonsterCount <= 0 || attackRadius < 0 || bombDamage <= 0) {
    console.error("Invalid input parameters detected. Monster count must be positive, attack radius non-negative, and bomb damage positive.");
    return 0; // Return zero bombs if parameters are invalid
  }

  // Prepare the list of enemy units (monsters) from subsequent lines
  // Each unit stores its [position, current_health]
  const enemyUnits = scenarioLines
    .slice(1, initialMonsterCount + 1) // Get only the lines corresponding to monsters
    .map(line => line.split(" ").map(Number)); // Convert each line to [position, health] array

  // Sort the enemy units by their position in ascending order
  // This ensures we always process the leftmost remaining monster first, which is crucial for the algorithm.
  enemyUnits.sort((unitA, unitB) => unitA[0] - unitB[0]);

  let totalBombsDeployed = 0; // Accumulator for the total number of bombs used in the battle

  // Iterate through each monster in the sorted list to determine necessary actions
  for (let currentMonsterIndex = 0; currentMonsterIndex < initialMonsterCount; ++currentMonsterIndex) {
    const currentMonster = enemyUnits[currentMonsterIndex];
    let currentMonsterHealth = currentMonster[1]; // Extract current monster's health

    // If the current monster has already been defeated (health <= 0) by previous bomb deployments, skip it.
    // This is a guard clause to avoid unnecessary calculations.
    if (currentMonsterHealth <= 0) {
      continue;
    }

    // Calculate how many bombs are needed to defeat this specific monster.
    // Math.ceil ensures we use enough bombs to fully reduce health to zero or less.
    const bombsForThisMonster = Math.ceil(currentMonsterHealth / bombDamage);

    // Add the required bombs to our total count.
    totalBombsDeployed += bombsForThisMonster;

    // Determine the maximum reach of a bomb strategically placed to hit the current monster.
    // A bomb placed at `currentMonster.position + attackRadius` will cover monsters
    // from `currentMonster.position` up to `currentMonster.position + (2 * attackRadius)`.
    // The `+ 1` is typically part of the problem's coordinate system or range definition.
    const effectiveDamageRangeEnd = currentMonster[0] + (2 * attackRadius) + 1;

    // Apply the damage from these `bombsForThisMonster` to all monsters within the calculated effective range,
    // starting from the current monster and moving right.
    // This inner loop leverages the sorted `enemyUnits` array for efficiency.
    for (let affectedUnitIndex = currentMonsterIndex; affectedUnitIndex < initialMonsterCount; ++affectedUnitIndex) {
      const affectedUnit = enemyUnits[affectedUnitIndex];
      const affectedUnitPosition = affectedUnit[0];

      // If the affected unit's position is beyond the effective range,
      // all subsequent units will also be out of range due to the array being sorted.
      // This is an early exit optimization.
      if (affectedUnitPosition > effectiveDamageRangeEnd) {
        break;
      }

      // Apply damage to the affected unit's health.
      // This directly modifies the health value within the `enemyUnits` array.
      affectedUnit[1] -= bombDamage * bombsForThisMonster;
    }
  }

  // Output the final calculated total number of bombs deployed.
  console.log(totalBombsDeployed);
};

// Main execution block: reads input from standard input and calls the processing function.
// Encapsulated within an Immediately Invoked Function Expression (IIFE) for scope management.
(function() {
  try {
    // Read all input data from /dev/stdin as UTF-8.
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Split the raw input into lines and filter out any empty lines.
    const inputLines = rawInputData.split("\n").filter(line => line.trim() !== '');

    // Basic validation for presence of input lines.
    if (inputLines.length === 0) {
      console.error("No input provided. Please ensure /dev/stdin contains data.");
      return;
    }

    // Call the main scenario processing function with the parsed input lines.
    processBattleScenario(inputLines);
  } catch (error) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("An error occurred during input reading or battle scenario processing:", error);
  }
})();