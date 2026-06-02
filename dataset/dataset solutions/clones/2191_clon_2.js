"use strict"; // Enforce strict parsing and error handling

/**
 * Processes the raw input data to determine if a character can survive
 * a series of attacks within a given number of turns.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInput(rawData) {
  // Trim leading/trailing whitespace and split the input into individual lines.
  const parsedLines = rawData.trim().split("\n");

  // Parse the initial health and the maximum allowed turns from the first line.
  // The first element is health, the second is the turn limit.
  let currentHP = parseInt(parsedLines[0].split(" ")[0]);
  const maxAllowedTurns = parseInt(parsedLines[0].split(" ")[1]);

  // Parse the attack damage values from the second line.
  // Each value is converted to an integer.
  const damageValues = parsedLines[1].split(" ").map(val => parseInt(val));

  // Initialize a counter for the number of turns taken.
  let turnCounter = 0;
  // Initialize an index to cycle through the attack damage values.
  let attackIndex = 0;

  // Loop as long as the character's health is non-negative.
  // This simulates the combat until the character's health drops below zero.
  while (currentHP >= 0) {
    // Increment the turn counter for each attack.
    turnCounter++;

    // If the attack index exceeds the available damage values,
    // reset it to the beginning of the array to cycle attacks.
    if (attackIndex >= damageValues.length) {
      attackIndex = 0;
    }

    // Subtract the current attack's damage from the character's health.
    currentHP = currentHP - damageValues[attackIndex];
    // Move to the next attack in the sequence.
    attackIndex++;
  }

  // After the loop, check if the character survived within the allowed turns.
  // If the total turns taken are less than or equal to the maximum allowed,
  // the character "survived".
  if (turnCounter <= maxAllowedTurns) {
    console.log("yes");
  } else {
    // Otherwise, the character did not survive within the limit.
    console.log("no");
  }
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
