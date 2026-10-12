let inputHandler = initializeInputReader(); // Initialize the input processing utility.
processInput(); // Begin the primary execution flow.

function readInteger() {
  return convertInput(getNextLine(), 1);
} // Reads the next line and parses it as an integer.
function readStringArray() {
  return convertInput(getNextLine(), 2);
} // Reads a line and splits it by spaces into a string array.
function readIntegerArray() {
  return convertInput(getNextLine(), 4);
} // Reads a line, splits by spaces, and converts to an array of numbers.
function readCharacterArray() {
  return convertInput(getNextLine(), 6);
} // Reads a line and splits it into an array of individual characters.
function getNextLine() {
  return inputHandler.fetchNext();
} // Retrieves the subsequent line from the input buffer.
function hasMoreLines() {
  return inputHandler.hasMore();
} // Checks if there are more lines available for reading.

function getInputData() {
  // Reads all data from standard input, decodes as UTF-8, trims whitespace, and splits into an array of lines.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputReader() {
  const rawInputLines = getInputData(); // Obtain all lines from the standard input.
  const readerObject = {
    "lineBuffer": rawInputLines, // Stores all input lines.
    "currentLineIndex": 0, // Tracks the current position in the input buffer.
    "totalLines": rawInputLines.length, // Total number of lines available.
    "hasMore": function() {
      // Determines if there are additional lines to read.
      return (this.currentLineIndex < this.totalLines);
    },
    "fetchNext": function() {
      // Retrieves the next line from the buffer. Throws an error if no more lines exist.
      if (!this.hasMore()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error message must be preserved.
      } else {
        const retrievedLine = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++; // Advance the index for the next read.
        return retrievedLine;
      }
    }
  };
  return readerObject; // Return the configured input reader.
}

function printOutput(content) {
  console.log(content); // Outputs the given content to standard output.
}
function printError(message) {
  console.error(message); // Outputs an error message to standard error.
}

/**
 * Handles various input conversions based on the specified type.
 * @param {string|Array} inputValue - The input value to convert.
 * @param {number} conversionType - The type of conversion to perform.
 *   - 1: Convert to integer.
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and convert elements to numbers.
 *   - 6: Split string into an array of characters.
 *   - 7: Split string into characters and convert elements to numbers.
 *   - 8: Join array elements with a space.
 *   - 9: Join array elements with a newline.
 *   - 0: Join array elements without any separator.
 *   - Default: Return input as is.
 * @returns {any} The converted value or the original input on error/unknown type.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((item) => Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((item) => Number(item));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    // In case of any conversion error, return the original input value.
    return inputValue;
  }
}

function processInput() {
  // Read the first line containing target health (H) and number of spells (N).
  const firstLineData = readIntegerArray();
  const targetHealth = firstLineData[0]; // The required health to defeat the monster.
  const numSpells = firstLineData[1]; // The total count of available spells.

  // Initialize an array to store spell details.
  const spellList = new Array(numSpells);
  for (let spellIndex = 0; spellIndex < numSpells; spellIndex++) {
    // Read spell damage and mana cost for each spell.
    const tempSpellData = readIntegerArray();
    spellList[spellIndex] = {
      "attackPower": tempSpellData[0], // The damage inflicted by this spell.
      "manaCost": tempSpellData[1] // The mana required to cast this spell.
    };
  }

  // Define a maximum health capacity for the DP array to avoid out-of-bounds issues.
  // This value is chosen to be sufficiently large to cover H and H + max_damage.
  const maxHealthCapacity = 100000;
  // Initialize a dynamic programming array to store the minimum mana cost
  // to achieve a certain amount of damage.
  const minManaCost = new Array(maxHealthCapacity); // Elements are initially 'undefined'.
  minManaCost[0] = 0; // It costs 0 mana to deal 0 damage.

  // Iterate through each spell.
  for (let spellIndex = 0; spellIndex < numSpells; spellIndex++) {
    // Iterate through possible current health values up to targetHealth.
    // The post-processing step will propagate costs from higher damage values.
    for (let currentHealth = 0; currentHealth < targetHealth; currentHealth++) {
      // Only proceed if a path to currentHealth is known (i.e., not undefined or null).
      if (minManaCost[currentHealth] != null) {
        const newDamage = currentHealth + spellList[spellIndex]["attackPower"];
        const newMana = minManaCost[currentHealth] + spellList[spellIndex]["manaCost"];

        // If this new damage value hasn't been reached before, or if the current path is cheaper.
        // The original code uses !dp[value] which evaluates to true for undefined, null, or 0.
        // Assuming mana costs are positive, this effectively checks for undefined/null.
        if (!minManaCost[newDamage]) {
          minManaCost[newDamage] = newMana;
        } else {
          minManaCost[newDamage] = Math.min(minManaCost[newDamage], newMana);
        }
      }
    }
  }

  // A large value to represent infinity or an unreachable state.
  const initialLargeValue = 1000000007;

  // Ensure the maxHealthCapacity index has a value, even if it's the large one.
  // This access implicitly extends the array if maxHealthCapacity is its current length.
  if (!minManaCost[maxHealthCapacity]) {
    minManaCost[maxHealthCapacity] = initialLargeValue;
  }

  // printError(minManaCost); // Debugging line, kept commented as in original.

  // Post-processing: Ensure that minManaCost[i] is the minimum mana to achieve AT LEAST i damage.
  // This means minManaCost[i] should be Math.min(minManaCost[i], minManaCost[i+1]).
  for (let healthPoint = maxHealthCapacity - 1; healthPoint >= 0; healthPoint--) {
    // The original code uses if(dp[i]) which evaluates to true for any truthy value (non-zero number).
    // This means if dp[i] is undefined or 0, it falls into the else branch.
    // Given mana costs are positive, dp[i] will be undefined or a positive number (except dp[0]=0).
    // So if(dp[i]) is true for positive numbers, false for undefined/0.
    if (minManaCost[healthPoint]) {
      minManaCost[healthPoint] = Math.min(minManaCost[healthPoint], minManaCost[healthPoint + 1]);
    } else {
      // If minManaCost[healthPoint] is undefined or 0, inherit the value from minManaCost[healthPoint + 1].
      minManaCost[healthPoint] = minManaCost[healthPoint + 1];
    }
  }

  // Output the minimum mana cost required to deal at least 'targetHealth' damage.
  printOutput(minManaCost[targetHealth]);
}
