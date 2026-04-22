"use strict"; /* Activate strict mode for enhanced error checking and cleaner code */

  const analyzeCharacterStream = inputContent => { // Function to process a given text stream
    // First, preprocess the raw input: remove any leading/trailing whitespace,
    // then divide the content into an array of lines based on newline characters.
    inputContent = inputContent.trim()
                               .split("\n");

    // Extract the very first line of the processed input and break it down
    // into an array of individual characters for sequential inspection.
    const charCollection = inputContent[0].split("");

    // Initialize a variable to store the character that was just examined
    // in the previous iteration of the loop. It starts as undefined.
    let precedingCharacter = undefined;

    // Begin iterating through each character's index within the 'charCollection' array.
    for ( let currentPosition in charCollection ) {
      // Check for a specific two-character sequence:
      // if the character before the current one was 'A' (ASCII 65)
      // AND the current character is 'C' (ASCII 67).
      if ( (precedingCharacter === String.fromCharCode(65)) && (charCollection[currentPosition] === String.fromCharCode(67)) ) {
        // If the target sequence is successfully identified,
        // print a confirmation message to the console.
        console.log("PositiveMatch");
        // Immediately exit the function as the goal has been achieved.
        return;
      }

      // After checking, update 'precedingCharacter' to be the character
      // that was just processed in this iteration, preparing for the next loop.
      precedingCharacter = charCollection[currentPosition];
    }

    // If the loop completes without finding the specific "AC" sequence,
    // print a message indicating that the pattern was not found.
    console.log("NegativeMatch");
  };

// The following lines handle the execution:
// It reads the entire content from standard input ('/dev/stdin') as UTF-8 encoded text,
// then passes this raw content to our primary processing function.
analyzeCharacterStream(require('fs').readFileSync('/dev/stdin', 'utf8'));