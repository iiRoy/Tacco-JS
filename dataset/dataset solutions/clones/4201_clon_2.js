function getInputData() {
  // Reads input from standard input, decodes as UTF-8, and removes leading/trailing whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputContent) {
  // Outputs the given content to standard output.
  console.log(outputContent);
}

function reportError(errorMessage) {
  // Outputs the given error message to standard error.
  console.error(errorMessage);
}

/**
 * Transforms an input string based on a specified conversion type.
 * @param {string} inputStr The string to be converted.
 * @param {number} conversionType The type of conversion to apply.
 *   0: No conversion, returns the string as is.
 *   1: Converts to an integer.
 *   2: Splits by single space.
 *   3: Splits by newline character.
 *   4: Splits by single space and converts parts to numbers.
 *   5: Splits by newline and converts parts to numbers.
 *   6: Splits into individual characters.
 *   7: Splits into individual characters and converts them to numbers.
 * @returns {any} The converted data.
 */
function processInputString(inputStr, conversionType) {
  switch (conversionType) {
    case 0:
      return inputStr;
    case 1:
      return parseInt(inputStr, 10);
    case 2:
      return inputStr.split(" ");
    case 3:
      return inputStr.split("\n");
    case 4:
      return inputStr.split(" ").map((val) => Number(val));
    case 5:
      return inputStr.split("\n").map((val) => Number(val));
    case 6:
      return inputStr.split("");
    case 7:
      return inputStr.split("").map((val) => Number(val));
    default:
      return inputStr; // Default to no conversion if type is unknown
  }
}

function executeLogic(rawInputChars) {
  // Convert the initial input string into an array of characters.
  rawInputChars = processInputString(rawInputChars, 6);

  // Store the first occurrence index of specific characters.
  const charPositions = {
    "K": rawInputChars.indexOf("K"),
    "I": rawInputChars.indexOf("I"),
    "H": rawInputChars.indexOf("H"),
    "B": rawInputChars.indexOf("B"),
    "R": rawInputChars.indexOf("R")
  };

  // Check if all required characters are present in the input.
  if (charPositions["K"] === -1 || charPositions["I"] === -1 || charPositions["H"] === -1 || charPositions["B"] === -1 || charPositions["R"] === -1) {
    displayResult("NO");
    return;
  }

  // Validate the total length of the input sequence.
  if (rawInputChars.length > 9) {
    displayResult("NO");
    return;
  }

  // Check specific positional relationships between characters.
  if (charPositions["K"] !== charPositions["I"] - 1 || charPositions["H"] < charPositions["I"]) {
    displayResult("NO");
    return;
  }

  // Check spacing and order for 'H' and 'B'.
  if (charPositions["H"] > charPositions["B"] || charPositions["B"] - charPositions["H"] > 2) {
    displayResult("NO");
    return;
  }

  // Check spacing and order for 'B' and 'R'.
  if (charPositions["B"] > charPositions["R"] || charPositions["R"] - charPositions["B"] > 2) {
    displayResult("NO");
    return;
  }

  // Count consecutive 'A' characters at the beginning of the sequence.
  let leadingACount = 0;
  for (let idx = 0; idx < rawInputChars.length; idx++) {
    if (rawInputChars[idx] === "A") {
      leadingACount++;
    } else {
      break; // Stop counting once a non-'A' character is encountered.
    }
  }

  // If there's more than one leading 'A', it's invalid.
  if (leadingACount > 1) {
    displayResult("NO");
    return;
  }

  // Count consecutive 'A' characters at the end of the sequence.
  let trailingACount = 0;
  for (let revIdx = rawInputChars.length - 1; revIdx >= 0; revIdx--) {
    if (rawInputChars[revIdx] === "A") {
      trailingACount++;
    } else {
      break; // Stop counting once a non-'A' character is encountered.
    }
  }

  // If there's more than one trailing 'A', it's invalid.
  if (trailingACount > 1) {
    displayResult("NO");
    return;
  }

  // If all checks pass, the sequence is valid.
  displayResult("YES");
}

// Execute the main logic with input obtained from standard input.
executeLogic(getInputData());
