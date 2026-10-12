'use strict';

function ProcessInput(rawData) {
  // Process raw input string: trim whitespace and split into lines
  rawData = rawData.trim().split('\n');

  // Parse the first line for initial parameters: target health and number of spells
  const initialParams = rawData[0].split(' ').map(str => parseInt(str, 10));
  const remainingLines = rawData.slice(1); // Get spell data lines

  const targetHealth = initialParams[0]; // H in original
  const numSpells = initialParams[1];    // N in original

  // Array to store spell details (damage and mana cost)
  const spellData = [];
  // Iterate through the remaining lines to populate spellData
  for (let spellIndex = 0; spellIndex < remainingLines.length; ++spellIndex) {
    const currentSpellInfo = remainingLines[spellIndex].split(' ').map(str => parseInt(str, 10));
    // Store spell as an object with renamed properties
    spellData.push({ damageAmount: currentSpellInfo[0], manaRequired: currentSpellInfo[1] });
  }

  // Initialize dynamic programming array to find minimum mana cost
  // Array size 9999 is a magic number from the original, preserving it.
  // Filled with 0s, which will be treated as 'not yet calculated' or 'unreachable'
  let minimumManaCost = Array(9999).fill(0);

  // Iterate through each available spell
  for (let spellIndex = 0; spellIndex < numSpells; ++spellIndex) {
    // For each spell, iterate through possible health points from its damage up to target health
    for (let currentHealthPoint = spellData[spellIndex].damageAmount; currentHealthPoint <= targetHealth; ++currentHealthPoint) {
      // If a path to currentHealthPoint already exists (cost is not 0)
      if (minimumManaCost[currentHealthPoint] !== 0) {
        // Update with the minimum of the current cost or the cost of reaching
        // (currentHealthPoint - spell's damage) plus the spell's mana cost
        minimumManaCost[currentHealthPoint] = Math.min(
          minimumManaCost[currentHealthPoint],
          minimumManaCost[currentHealthPoint - spellData[spellIndex].damageAmount] + spellData[spellIndex].manaRequired
        );
      } else {
        // If no path existed yet, set the cost directly
        minimumManaCost[currentHealthPoint] =
          minimumManaCost[currentHealthPoint - spellData[spellIndex].damageAmount] + spellData[spellIndex].manaRequired;
      }
    }
  }

  // Output the minimum mana cost to reach the target health
  console.log(minimumManaCost[targetHealth]);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
