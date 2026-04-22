/*
 *  This utility script was crafted by a developer on a previous occasion.
 *  It processes standard input to generate a specific output sequence.
 */

var fileSystemModule = require('fs')                                      ,
    inputDataSize = fileSystemModule.fstatSync(process.stdin.fd).size       , // Determine the total byte size of the input stream.
    readDataBlock = new Buffer(inputDataSize)                               , // Allocate a memory buffer for the incoming data.
    actualBytesRead = fileSystemModule.readSync(process.stdin.fd, readDataBlock, 0, inputDataSize, 0) , // Read the data into the buffer.
    textLines = readDataBlock.toString('utf8', 0, actualBytesRead).split('\n') ; // Convert buffer to UTF-8 string and split into lines.


// Initiates the core text processing operation.
executeProcessing();


/**
 *  Performs the primary transformation logic on the input text.
 *  Generates a sequence of characters based on character code differences.
 */
function executeProcessing() {

  var initialText = textLines[0]                               , // The first line from the input array.
      finalResult = ''                                         , // Accumulates the final output sequence.
      loopIndex                                                , // General purpose loop counter.
      textLength                                               , // Stores the length of the initial text.
      innerCounter                                             , // Counter for nested loops.
      valueDifference                                          , // Holds the difference between character codes.
      rootValue                                                , // Stores the integer square root.
      signIndicator                                            , // Character indicating positive or negative ('+' or '-').
      previousCharValue = 0                                    , // The character code of the previous character, initialized to zero.
      limitConstant = 16                                       , // A threshold value for difference handling.
      characterValueArray = []                                   ; // An array to store ASCII/Unicode values of characters.


  // Populate the character value array by iterating through the input string.
  for (loopIndex = 0, textLength = initialText.length; loopIndex < textLength; loopIndex++) {
    characterValueArray[loopIndex] = initialText.charCodeAt(loopIndex);
  }


  // Main processing loop: iterate through character codes to build the result.
  for (loopIndex = 0; loopIndex < textLength; previousCharValue = characterValueArray[loopIndex], loopIndex++) {

    valueDifference = characterValueArray[loopIndex] - previousCharValue; // Calculate the difference from the prior character.

    // If the difference is zero, append a dot and move to the next character.
    if (valueDifference === 0) {
      finalResult += '.';
      continue;
    }

    // Determine if the difference is positive or negative.
    signIndicator = valueDifference > 0 ? '+' : '-';
    valueDifference = Math.abs(valueDifference); // Work with the absolute difference.


    // Branch based on whether the absolute difference is less than the predefined constant.
    if (valueDifference < limitConstant) {

      // For small differences, append the sign indicator repeatedly.
      for (innerCounter = valueDifference; innerCounter > 0; innerCounter--) {
        finalResult += signIndicator;
      }

    } else { // Handle larger differences using a more complex pattern.

      rootValue = ~~Math.sqrt(valueDifference); // Calculate integer square root of the difference.

      finalResult += '>'; // Append a 'move pointer right' instruction.

      // Append '+' characters based on the square root value.
      for (innerCounter = rootValue; innerCounter > 0; innerCounter--) {
        finalResult += '+';
      }

      finalResult += '[<'; // Start a loop block, move pointer left.

      // Append sign indicator characters based on the square root value within the loop.
      for (innerCounter = rootValue; innerCounter > 0; innerCounter--) {
        finalResult += signIndicator;
      }

      finalResult += '>-]<'; // End loop block, move pointer right, then move pointer left.

      // Append remaining sign indicator characters for the remainder after square root operation.
      for (innerCounter = valueDifference - rootValue * rootValue; innerCounter > 0; innerCounter--) {
        finalResult += signIndicator;
      }

    }

    finalResult += '.'; // Append a final dot for the current character's processing.

  }

  // Output the generated sequence to the standard console.
  console.log(finalResult);

}