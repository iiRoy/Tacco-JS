// This module processes the entire provided textual content.
function ProcessTextData( receivedSource ) {

  /*
   * The initial line typically resides in receivedSource[0],
   * the subsequent line in receivedSource[1], and so forth.
   */
  // receivedSource = receivedSource.split("\n"); // This line is for processing line by line, currently inactive.

  let calculatedTally = 0; // Initialize our score counter.

  const characterArray = receivedSource.split(""); // Break down the incoming string into individual characters.

  characterArray.forEach(function(currentSymbol) { // Iterate through each character.
    if (currentSymbol === '-') { // If the character indicates a decrement.
      calculatedTally--; // Decrease the tally.
    } else { // Otherwise, it implies an increment.
      calculatedTally++; // Increase the tally.
    }
  });

  /*
   * // A more complex example for array manipulation:
   * // thresholdValue = receivedSource[0].split(' ').map((val) => (parseInt(val)))[1];
   * // numericList = receivedSource[1].split(' ').map((val) => (parseInt(val)));
   * // finalResult = numericList.filter((val) => (thresholdValue <= val)).length;
   */

  // Display the outcome.
  console.log( calculatedTally + '\n' );
}

/*
 * !!! DO NOT MODIFY THE FOLLOWING SECTION !!!
 * This part handles standard input/output operations
 * and invokes the primary processing function.
 */
ProcessTextData( require("fs").readFileSync("/dev/stdin", "utf8") );
// ProcessTextData(require('fs').readFileSync('./alternative_input.txt', 'utf-8')); // For local testing with a file.