/*
 This script processes a series of numerical values provided as a single string.
 It simulates a battle or resource depletion scenario based on specific rules.
 The final outcome depends on the remaining value of the primary resource.
*/

function ProcessInput(rawData) {
  // The initial string is split into individual numerical tokens.
  let tokenizedData = rawData.split(" ");

  // Convert string tokens to integer values for calculations.
  // The first value represents the initial health or resource of entity A.
  let entityAHealth = parseInt(tokenizedData[0], 10);
  // The second value represents the attack power of entity B.
  const entityBAttack = parseInt(tokenizedData[1], 10);
  // The third value represents the initial health or resource of entity C.
  let entityCHealth = parseInt(tokenizedData[2], 10);
  // The fourth value represents the attack power of entity D.
  const entityDAttack = parseInt(tokenizedData[3], 10);

  // Loop while both entity C and entity A have positive health.
  while (entityCHealth > 0 && entityAHealth > 0) {
    // Entity C takes damage from entity B.
    entityCHealth = entityCHealth - entityBAttack;

    // Check if entity C's health has dropped to zero or below.
    if (entityCHealth <= 0) {
      // If entity C is defeated, the loop terminates.
      break;
    } else {
      // If entity C is still alive, entity A takes damage from entity D.
      entityAHealth = entityAHealth - entityDAttack;
    }
  }

  // After the loop, determine the final outcome based on entity A's remaining health.
  if (entityAHealth > 0) {
    // If entity A still has health, print 'Yes'.
    console.log('Yes');
  } else {
    // Otherwise, if entity A's health is zero or below, print 'No'.
    console.log('No');
  }
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
