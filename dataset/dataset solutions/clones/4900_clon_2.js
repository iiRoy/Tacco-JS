var inputString = "FFFFdfadadadfd"; // The initial string data for processing.

// Converts the main string into an array of individual characters.
var charArray = inputString.split('');

// Boolean flags to track the discovery of specific characters during iteration.
var foundC = false; // Flag becomes true if the character 'C' is encountered.
var foundF = false; // This flag is declared but its state is not modified or used in the current logic.

/**
 * Examines a global character array for a particular two-character sequence.
 * The function accepts a parameter, but its internal logic operates on a globally scoped array.
 * @param {string} inputParam - A string argument; it is not referenced within the function's body.
 * @returns {boolean} Returns 'true' if 'C' is found, immediately followed by 'F' at any later point; otherwise, returns 'false'.
 */
function checkSequence(inputParam) {
  // Loop through each element of the character array from the beginning.
  for (var idx = 0; idx < charArray.length; idx++) {
    // If the current character matches 'C', set the 'foundC' flag.
    if (charArray[idx] == "C") {
      foundC = true;
    }

    // If the current character is 'F' AND 'C' has already been found, the target sequence is complete.
    if (charArray[idx] == "F" && foundC == true) {
      return true; // Exit the function and return true upon finding the sequence.
      // A 'break' statement here would be unreachable as 'return' terminates execution first.
      break;
    }
  }

  // If the loop finishes without returning true, check the final state of the flags.
  // The 'foundF' flag is always false here, so this condition effectively checks if 'foundC' is false.
  if (foundC != true && foundF != true) {
    return false; // Return false if the sequence was not found.
  }
}

// Invoke the sequence checking function with the global string.
// The value passed as an argument here does not influence the function's execution path.
checkSequence(inputString);
