/* This script processes standard input to decode a Caesar-like cipher.
 * It attempts to find a specific shift value for each line based on
 * common English words, then applies that shift to the entire line.
 */

// Function to orchestrate the text processing flow.
function executeCipher
(
  /* No parameters for the primary function. */
)
{
  // Define ASCII values for key characters 'a', 't', 'z'.
  // These are used for shift calculations and character wrapping.
  var
    lowerA_Code = 'a'.charCodeAt(0), /* The ASCII value for the character 'a'. */
    baseT_Code = 't'.charCodeAt(0),   // ASCII value for 't', used as a reference point.
    upperZ_Code = 'z'.charCodeAt(0);  /* The ASCII value for 'z'. */


  /**
   * Transforms a single character by applying a given displacement value.
   * Handles wrapping around the alphabet (a-z) only for values exceeding 'z'.
   *
   * @param {string} inputChar - The character to be shifted.
   * @param {number} displacementValue - The amount by which to shift the character.
   * @returns {string} The shifted character, or the original if it's a space or dot.
   */
  function
  applyShift
  (
    inputChar,
    displacementValue
  )
  {
    // Do not alter whitespace or punctuation.
    if
    (
      inputChar === ' ' || inputChar === '.'
    )
    {
      return inputChar;
    }

    // Convert character to its ASCII representation.
    let
      charAsNum = inputChar.charCodeAt(0);

    // Subtract the shift amount.
    charAsNum -= displacementValue;

    // Handle alphabetical wrap-around if the character code goes above 'z'.
    // The original logic only handles values that wrap past 'z', not below 'a'.
    return String.fromCharCode
    (
      charAsNum > upperZ_Code ? lowerA_Code + charAsNum - upperZ_Code : charAsNum
    );
  }


  /**
   * Computes a numerical offset value based on the first character of a word.
   * The offset is calculated relative to the ASCII value of 't'.
   *
   * @param {string} currentToken - The word (or its first character) to determine the offset from.
   * @returns {number} The calculated shift offset.
   */
  function
  calculateOffset
  (
    currentToken
  )
  {
    let
      calculatedValue = currentToken.charCodeAt(0) - baseT_Code;

    // Adjust for negative values to ensure the offset wraps correctly within a specific range.
    return calculatedValue < 0 ? (upperZ_Code - baseT_Code) + (-calculatedValue) : calculatedValue;
  }

  // Iterate through each line of the buffered input.
  incomingData.forEach
  (
    function
    (
      currentLine
    )
    {
      var
        lineOffsetResult, // Stores the final shift value for the current line.
        parsedTextElements; // Holds words split from the line.

      // Skip processing for any completely empty lines.
      if (currentLine.trim() === '')
      {
        return;
      }

      // Split the line into individual words using spaces or periods as delimiters.
      parsedTextElements = currentLine.split
      (
        /[ \.]/g
      );

      // Loop through each segmented word to find the correct shift.
      for
      (
        let wordIndex = 0; // Initialize loop counter.
        wordIndex < parsedTextElements.length; // Loop condition.
        wordIndex++ // Increment counter.
      )
      {
        // Determine the potential shift value using the current word.
        lineOffsetResult = calculateOffset
        (
          parsedTextElements[wordIndex]
        );

        // Check if the word, when shifted, matches any of the target words: 'the', 'this', 'that'.
        // This is the core logic for identifying the correct decryption shift.
        if
        (
          parsedTextElements[wordIndex].split('').map
          (
            function (charToProcess)
            {
              return applyShift
              (
                charToProcess,
                lineOffsetResult
              );
            }
          ).join('') in
          {
            'the': 0, // Target word one.
            'this': 0, // Target word two.
            'that': 0 // Target word three.
          }
        )
        {
          break; // Exit loop once a matching shifted word is found.
        }
      }

      // Apply the determined shift to the entire original line and print the result.
      console.log
      (
        currentLine.split('').map
        (
          function (charToProcess)
          {
            return applyShift
            (
              charToProcess,
              lineOffsetResult
            );
          }
        ).join('')
      );
    }
  );
}


// --- Global Execution Context Setup ---

var
  incomingData = ''; // Buffer for accumulating input from stdin.

// Resume standard input stream.
process.stdin.resume();

// Set character encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on
(
  'data',
  function
  (
    dataBlock
  )
  {
    incomingData += dataBlock; // Append new data to the buffer.
  }
);

// Event listener for the end of the input stream.
process.stdin.on
(
  'end',
  function
  (
    /* No parameters */
  )
  {
    // Split the accumulated input into an array of lines.
    incomingData = incomingData.split('\n');
    // Initiate the main processing function.
    executeCipher();
  }
);