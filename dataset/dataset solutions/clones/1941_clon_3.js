// Function to orchestrate a simulated combat encounter based on provided string data.
function executeBattleSimulation(rawDataString) {
  // Split the incoming data string into individual components using space as a delimiter.
  const inputComponents = rawDataString.split(' ');

  // Define a helper utility for safely converting string components to integer values.
  // This helps in handling potential non-numeric or invalid inputs.
  const parseNumericProperty = (propertyString) => {
    const numericValue = Number.parseInt(propertyString, 10);
    // Introduce validation: if parsing results in NaN or a negative number (invalid for HP/AK),
    // log an error and default to 0 to prevent further issues, representing a defeated state or no power.
    if (Number.isNaN(numericValue) || numericValue < 0) {
      console.error(`Input data error: Non-numeric or negative value encountered for a combat property: '${propertyString}'. Defaulting to 0.`);
      return 0; // A new fragment: error handling and default value.
    }
    return numericValue;
  };

  // Pre-battle validation: Ensure all necessary combat parameters are present.
  // We expect four distinct numerical values for two combatants (HP and Attack for each).
  if (inputComponents.length < 4) {
    console.error("Critical Error: Insufficient parameters provided to initiate the battle simulation. Expected 4 numeric values.");
    // This guard clause prevents execution with malformed input.
    return;
  }

  // Initialize the health and attack power for the protagonist and antagonist.
  // Using 'let' as these values will dynamically change throughout the battle.
  let protagonistCurrentHealth = parseNumericProperty(inputComponents[0]); // Represents Takagi's health points.
  let protagonistCurrentAttack = parseNumericProperty(inputComponents[1]); // Represents Takagi's attack strength.
  let antagonistCurrentHealth = parseNumericProperty(inputComponents[2]);  // Represents Aoki's health points.
  let antagonistCurrentAttack = parseNumericProperty(inputComponents[3]);  // Represents Aoki's attack strength.

  // A control flag to manage the main battle loop. The battle continues as long as this is true.
  let isBattleInProgress = true;
  // An additional helper variable to track the progression of the battle.
  let combatRoundCount = 0;

  // The primary combat loop: continues as long as both combatants are active.
  while (isBattleInProgress) {
    combatRoundCount++; // Increment the round counter at the start of each new turn.

    // Step 1: Protagonist launches an assault against the Antagonist.
    const damageInflictedByProtagonist = protagonistCurrentAttack; // Intermediate variable for clarity.
    antagonistCurrentHealth = antagonistCurrentHealth - damageInflictedByProtagonist; // Explicit subtraction.

    // Check immediately if the Antagonist has been defeated after taking damage.
    if (antagonistCurrentHealth <= 0) {
      isBattleInProgress = false; // Update the battle state flag.
      break; // Exit the loop as the battle has concluded.
    }

    // Step 2: Antagonist retaliates and strikes back at the Protagonist.
    const damageInflictedByAntagonist = antagonistCurrentAttack; // Intermediate variable.
    protagonistCurrentHealth = protagonistCurrentHealth - damageInflictedByAntagonist; // Explicit subtraction.

    // Check if the Protagonist has been defeated after the Antagonist's attack.
    if (protagonistCurrentHealth <= 0) {
      isBattleInProgress = false; // Update the battle state flag.
      break; // Exit the loop as the battle has concluded.
    }

    // If both combatants are still standing, the loop will continue to the next round.
  }

  // After the battle concludes, determine and format the final outcome.
  let finalBattleConclusion;
  if (antagonistCurrentHealth <= 0) {
    // If the Antagonist's health dropped to zero or below, the Protagonist is victorious.
    finalBattleConclusion = 'The Protagonist emerges victorious!';
  } else {
    // Otherwise, the Protagonist's health dropped first, indicating the Antagonist's win.
    finalBattleConclusion = 'The Antagonist claims victory!';
  }

  // Display the determined outcome to the console.
  console.log(finalBattleConclusion);
}

// Application entry point for execution.
// This section reads data from standard input, typically used in competitive programming environments.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Invoke the battle simulation function with the acquired input.
executeBattleSimulation(standardInputContent);