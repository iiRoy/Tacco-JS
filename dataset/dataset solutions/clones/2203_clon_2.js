var inputProcessor = initializeInputHandler();
executeMainLogic();

// Function to get the next integer from input
function retrieveNextInteger() {
  return transformInput(fetchNextLine(), 1);
}

// Function to get the next line as a string array (space-separated)
function retrieveNextStringArray() {
  return transformInput(fetchNextLine(), 2);
}

// Function to get the next line as an integer array (space-separated)
function retrieveNextIntegerArray() {
  return transformInput(fetchNextLine(), 4);
}

// Function to get the next line as a character array
function retrieveNextCharacterArray() {
  return transformInput(fetchNextLine(), 6);
}

// Fetches the next available line from the input buffer
function fetchNextLine() {
  return inputProcessor.next();
}

// Checks if there are more lines to process
function hasMoreLines() {
  return inputProcessor.hasNext();
}

// Reads the entire standard input file
function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

// Initializes the input handling object
function initializeInputHandler() {
  var rawInputLines = readInputFile();
  var inputHandlerObject = {
    "lineBuffer": rawInputLines,
    "currentLineIndex": 0,
    "totalLines": rawInputLines.length,
    "hasNext": function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "next": function() {
      if (!this.hasNext()) {
        throw "InputBufferExhaustedException: No more lines available.";
      } else {
        var currentLineContent = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return inputHandlerObject;
}

// Displays output to standard output
function displayOutput(messageContent) {
  console.log(messageContent);
}

// Logs messages to standard error output
function logError(messageContent) {
  console.error(messageContent);
}

/*
  Input transformation utility.
  Converts input based on the specified type.
  - 1: Convert to integer.
  - 2: Split by space into string array.
  - 4: Split by space and convert to number array.
  - 6: Split by character into string array.
  - 7: Split by character and convert to number array.
  - 8: Join array elements with space.
  - 9: Join array elements with newline.
  - 0: Join array elements without separator.
  - Default: Return input as is.
*/
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
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
    return inputValue; // Return original value on error
  }
}

// Main program logic execution
function executeMainLogic() {
  var firstLineData = retrieveNextIntegerArray();
  var targetHealth = firstLineData[0];
  var spellCount = firstLineData[1];

  var spellList = new Array(spellCount);
  for (var spellIndex = 0; spellIndex < spellCount; spellIndex++) {
    var tempSpellData = retrieveNextIntegerArray();
    spellList[spellIndex] = {
      "attackPower": tempSpellData[0],
      "manaCost": tempSpellData[1]
    };
  }

  // Dynamic programming array to store minimum mana cost for a given health
  // Array size is (targetHealth + 1) * 2 to handle potential overflows and indexing
  var minManaCost = new Array((targetHealth + 1) * 2);
  minManaCost[0] = 0; // Base case: 0 mana for 0 damage

  // Iterate through each spell
  for (var currentSpellIdx = 0; currentSpellIdx < spellCount; currentSpellIdx++) {
    // Iterate through possible health values
    for (var currentHealth = 0; currentHealth < targetHealth; currentHealth++) {
      // If a path to currentHealth exists (i.e., minManaCost[currentHealth] is not null)
      if (minManaCost[currentHealth] != null) {
        var newHealth = currentHealth + spellList[currentSpellIdx]["attackPower"];
        var newMana = minManaCost[currentHealth] + spellList[currentSpellIdx]["manaCost"];

        // If this new health state hasn't been reached yet, or if this path is cheaper
        if (!minManaCost[newHealth]) {
          minManaCost[newHealth] = newMana;
        } else {
          minManaCost[newHealth] = Math.min(minManaCost[newHealth], newMana);
        }
      }
    }
  }

  var infinityValue = 1000000007; // A large number representing infinity

  // Initialize a sentinel value at the end of the DP array if not set
  if (!minManaCost[targetHealth * 2 + 1]) {
    minManaCost[targetHealth * 2 + 1] = infinityValue;
  }

  // Propagate minimums backwards to ensure minManaCost[i] holds the minimum cost
  // to reach at least 'i' health.
  for (var healthIdx = targetHealth * 2; healthIdx >= 0; healthIdx--) {
    if (minManaCost[healthIdx]) {
      minManaCost[healthIdx] = Math.min(minManaCost[healthIdx], minManaCost[healthIdx + 1]);
    } else {
      minManaCost[healthIdx] = minManaCost[healthIdx + 1];
    }
  }

  // Output the minimum mana cost to reach at least targetHealth
  displayOutput(minManaCost[targetHealth]);
}
