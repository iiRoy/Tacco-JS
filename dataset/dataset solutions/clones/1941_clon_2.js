function processGame(gameData) {
  // Split the input string by spaces to get individual data points
  const dataParts = gameData.split(' ');

  // Parse initial health and attack values for two combatants
  // Combatant A (formerly Takagi)
  var playerAHealth = parseInt(dataParts[0], 10);
  var playerAAttack = parseInt(dataParts[1], 10);

  // Combatant B (formerly Aoki)
  var playerBHealth = parseInt(dataParts[2], 10);
  var playerBAttack = parseInt(dataParts[3], 10);

  // Simulate a turn-based battle until one combatant's health drops to zero or below
  while (playerAHealth > 0 && playerBHealth > 0) {
    // Combatant A attacks Combatant B
    playerBHealth -= playerAAttack;
    // Check if Combatant B is defeated
    if (playerBHealth <= 0) {
      break; // End the battle
    }

    // Combatant B attacks Combatant A
    playerAHealth -= playerBAttack;
    // Check if Combatant A is defeated
    if (playerAHealth <= 0) {
      break; // End the battle
    }
  }

  // Determine the winner based on remaining health
  if (playerBHealth <= 0) {
    // If Combatant B's health is zero or less, Combatant A wins
    console.log('Yes');
  } else {
    // Otherwise, Combatant B wins (Combatant A's health is zero or less)
    console.log('No');
  }
}

// Read input from standard input and pass it to the game processing function
processGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
