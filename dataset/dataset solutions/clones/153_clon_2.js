( function ( rawDataInput ) {
  // Process the raw input string
  var parsedLines = rawDataInput.replace( /\n$/, '' ) . split( '\n' );

  // Determine the total number of lines to process
  var lineQuantity = parsedLines . length;

  /*
   * Iterate through each line of the input data.
   * Each line represents a set of numbers to be analyzed.
   */
  for ( var currentLineIdx = 0 ; currentLineIdx < lineQuantity ; currentLineIdx++ ) {
    // Extract the current line, split by comma, and convert to numeric values
    var numericValues = parsedLines . shift() . split( ',' ) . map( parseFloat );

    // Initialize an object to store the frequency of each number
    var valueOccurrences = {};

    // Calculate the frequency of each number in the current set
    for ( var valueIdx = 0 ; valueIdx < numericValues . length ; valueIdx++ ) {
      var currentNumber = numericValues[valueIdx];
      if ( currentNumber in valueOccurrences ) {
        valueOccurrences[currentNumber]++; // Increment count if number already seen
      } else {
        valueOccurrences[currentNumber] = 1; // Initialize count if number is new
      }
    }

    // Initialize an array to group numbers by their frequencies
    // The index of this array will represent the frequency count
    var groupedOccurrences = [];

    // Populate the groupedOccurrences array
    for ( var occurrenceKey in valueOccurrences ) {
      var frequencyCount = valueOccurrences[occurrenceKey];
      if ( groupedOccurrences[frequencyCount] ) {
        groupedOccurrences[frequencyCount] . push( occurrenceKey ); // Add to existing frequency group
      } else {
        groupedOccurrences[frequencyCount] = [ occurrenceKey ]; // Create new frequency group
      }
    }

    // Log the result of the hand determination function
    console . log( determineHandType( groupedOccurrences ) );
  }
} ) ( fetchModule( 'fs' ) . obtainFileContents( 'inputFilePath', 'textEncoding' ) );

/**
 * Determines the type of "hand" based on the frequency grouping of numbers.
 * This function mimics poker-hand evaluation logic.
 *
 * @param {Array<Array<string>>} occurrenceGroups - An array where index represents frequency,
 *                                                and value is an array of numbers with that frequency.
 * @returns {string} The determined hand type (e.g., 'four card', 'straight', 'null').
 */
function determineHandType ( occurrenceGroups ) {
  // Check for "four card" (four of a kind)
  if ( occurrenceGroups[4] ) {
    return 'four card';
  }

  // Check for "full house" (three of a kind and a pair)
  if ( occurrenceGroups[3] && occurrenceGroups[2] ) {
    return 'full house';
  }

  // Check for "straight" (five consecutive numbers)
  if ( occurrenceGroups[1] && occurrenceGroups[1] . length === 5 ) {
    var sortedNumbers = occurrenceGroups[1];
    // Convert to numbers and sort them numerically
    sortedNumbers = sortedNumbers . map( parseFloat ) . sort( function ( currentVal, compareTo ) {
      return currentVal - compareTo;
    } );

    // Specific rule: if the smallest number is greater than 9, it's considered "null"
    if ( sortedNumbers[0] > 9 ) {
      return 'null';
    }

    // Specific rule: if the second number is 10, it's a "straight"
    // This handles cases like (9,10,11,12,13)
    if ( sortedNumbers[1] === 10 ) {
      return 'straight';
    }

    // General straight check: numbers are consecutive
    if ( sortedNumbers[1] === sortedNumbers[0] + 1 &&
         sortedNumbers[2] === sortedNumbers[1] + 1 &&
         sortedNumbers[3] === sortedNumbers[2] + 1 &&
         sortedNumbers[4] === sortedNumbers[3] + 1 ) {
      return 'straight';
    }
  }

  // Check for "three card" (three of a kind)
  if ( occurrenceGroups[3] ) {
    return 'three card';
  }

  // Check for "two pair" (two separate pairs)
  if ( occurrenceGroups[2] && occurrenceGroups[2] . length === 2 ) {
    return 'two pair';
  }

  // Check for "one pair" (a single pair)
  if ( occurrenceGroups[2] ) {
    return 'one pair';
  }

  // If no other hand type matches, return "null"
  return 'null';
}