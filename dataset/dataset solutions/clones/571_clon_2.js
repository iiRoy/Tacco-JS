var      fileSystemModule =  require('fs'); // Obtain the necessary file system utility.

/*
 * This section is responsible for reading the entire content
 * from the standard input stream. The content is expected
 * to be encoded in UTF-8 format.
 */
var    rawTextData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw text: remove any leading or trailing whitespace, then divide into an array of individual lines.
var    processedTextLines = (rawTextData.trim()).split("\n");

/*
 * Iterate through each of the separated lines.
 * For every line, we will perform a specific sequence analysis.
 */
processedTextLines.forEach(  function(activeInputLine ) {

   // Initialize a counter to track occurrences of the first target pattern (e.g., "JOI").
   var    primaryPatternTally = 0;
   // Initialize a counter for the second distinct target pattern (e.g., "IOI").
   var    secondaryPatternTally = 0;

   // Begin scanning the current line character by character.
   // The loop terminates early to ensure there are always at least three characters remaining
   // for substring extraction at the current position.
   for (   var charSearchIndex = 0;   charSearchIndex < activeInputLine.length - 2;   charSearchIndex++   ) {

      // Construct a three-character sequence starting from the current index.
      var    currentThreeChars = activeInputLine[charSearchIndex] + activeInputLine[charSearchIndex + 1] + activeInputLine[charSearchIndex + 2];

      // Check if the extracted sequence matches the first predefined pattern.
      if ( currentThreeChars == "JOI" ) {
         primaryPatternTally++; // Increment the counter for the first pattern.
      }

      // Check if the extracted sequence matches the second predefined pattern.
      if ( currentThreeChars == "IOI" ) {
         secondaryPatternTally++; // Increment the counter for the second pattern.
      }

   } // End of the inner loop for character scanning within the current line.

   // Output the final count for the first pattern found in this line.
   console.log(   primaryPatternTally   );
   // Output the final count for the second pattern found in this line.
   console.log(   secondaryPatternTally   );

}  ); // End of the outer loop iterating through each processed input line.

/*
 * This script completes its execution after reporting the counts
 * for both target patterns for every line of the input.
 */