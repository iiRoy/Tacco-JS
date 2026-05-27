function readInputString() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(message) {
  console.log(message);
}

function logErrorToConsole(errorMessage) {
  console.error(errorMessage);
}

// Helper function to convert the input string into an array of characters
function splitStringToCharacters(inputString) {
  return inputString.split("");
}

// Helper function to check a condition and, if true, output "NO" and indicate an exit
function evaluateConditionAndExit(conditionMet, outputFunction) {
  if (conditionMet) {
    outputFunction("NO");
    return true; // Signal to the caller that an exit is required
  }
  return false; // Signal to the caller to continue processing
}

// Helper function to count consecutive occurrences of a character from the start
function countLeadingCharOccurrences(charArray, charToFind) {
  let currentCount = 0;
  for (let charIndex = 0; charIndex < charArray.length; charIndex++) {
    if (charArray[charIndex] === charToFind) {
      currentCount++;
    } else {
      break; // Stop counting when a different character is encountered
    }
  }
  return currentCount;
}

// Helper function to count consecutive occurrences of a character from the end
function countTrailingCharOccurrences(charArray, charToFind) {
  let currentCount = 0;
  for (let charIndex = charArray.length - 1; charIndex >= 0; charIndex--) {
    if (charArray[charIndex] === charToFind) {
      currentCount++;
    } else {
      break; // Stop counting when a different character is encountered
    }
  }
  return currentCount;
}

function ProcessMainLogic(rawInputContent) {
  const characterSequence = splitStringToCharacters(rawInputContent);

  const requiredKeyChars = ["K", "I", "H", "B", "R"];
  const targetCharPositions = {};

  // Determine the first occurrence index for each required character
  for (const keyChar of requiredKeyChars) {
    targetCharPositions[keyChar] = characterSequence.indexOf(keyChar);
  }

  // Check if any of the required characters are missing from the input sequence
  const isAnyKeyCharMissing = requiredKeyChars.some(char => targetCharPositions[char] === -1);
  if (evaluateConditionAndExit(isAnyKeyCharMissing, printOutput)) return;

  // Extract positions for easier comparison
  const kPosition = targetCharPositions["K"];
  const iPosition = targetCharPositions["I"];
  const hPosition = targetCharPositions["H"];
  const bPosition = targetCharPositions["B"];
  const rPosition = targetCharPositions["R"];

  // Verify the correct sequential order of the key characters
  const isOrderIncorrect = kPosition > iPosition || iPosition > hPosition ||
                           hPosition > bPosition || bPosition > rPosition;
  if (evaluateConditionAndExit(isOrderIncorrect, printOutput)) return;

  // Check if the total length of the input sequence exceeds 9 characters
  if (evaluateConditionAndExit(characterSequence.length > 9, printOutput)) return;

  // Ensure 'K' and 'I' are adjacent (K immediately followed by I)
  if (evaluateConditionAndExit(kPosition !== iPosition - 1, printOutput)) return;

  // Calculate the distance between 'H' and 'B'
  const hToBDistance = bPosition - hPosition;
  if (evaluateConditionAndExit(hToBDistance > 2, printOutput)) return;

  // Special handling for H-B distance of exactly 2 (original code's bug replicated)
  if (hToBDistance === 2) {
    // The original code had: var tmp = input[list["B"]]-1; if(tmp != "A")
    // This evaluates to characterSequence[bPosition] (e.g., 'B') - 1, which results in NaN.
    // NaN !== "A" is always true. Thus, this condition always leads to "NO" if hToBDistance is 2.
    const buggyIntermediateValue = characterSequence[bPosition] - 1;
    if (evaluateConditionAndExit(buggyIntermediateValue !== "A", printOutput)) return;
  }

  // Calculate the distance between 'B' and 'R'
  const bToRDistance = rPosition - bPosition;
  if (evaluateConditionAndExit(bToRDistance > 2, printOutput)) return;

  // Special handling for B-R distance of exactly 2 (original code's bug replicated)
  if (bToRDistance === 2) {
    // Similar to the H-B check, this replicates the original bug.
    const anotherBuggyIntermediateValue = characterSequence[rPosition] - 1;
    if (evaluateConditionAndExit(anotherBuggyIntermediateValue !== "A", printOutput)) return;
  }

  // Count consecutive 'A's at the beginning of the sequence
  const initialACount = countLeadingCharOccurrences(characterSequence, "A");
  if (evaluateConditionAndExit(initialACount > 1, printOutput)) return;

  // Count consecutive 'A's at the end of the sequence
  const finalACount = countTrailingCharOccurrences(characterSequence, "A");
  if (evaluateConditionAndExit(finalACount > 1, printOutput)) return;

  // If all conditions are met, the sequence is valid
  printOutput("YES");
}

// Execute the main logic with input from stdin
ProcessMainLogic(readInputString());
