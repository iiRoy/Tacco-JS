/* This JavaScript segment processes multiple numerical inputs, applying
 * a specific calculation involving denominations or change from a total. */

var  sourceContent = require('fs')
    . readFileSync(
        '/dev/stdin',  /* Specifies the standard input file path */
        'utf8'         /* Sets the character encoding for file reading */
    ) ;


// Transform the raw input string into an array of numeric values.
// First, whitespace is trimmed, then the string is split by newlines,
// and finally, each resulting string element is converted to a number.
var  numericDataset = (sourceContent.trim())
    . split("\n")
    . map(Number) ;


/* Initiate a loop to process each individual numerical entry within the dataset. */
for (
    var  entryIndex = 0 ;
    entryIndex < numericDataset.length ;
    entryIndex++
) {
    // Fetch the current numerical entry to be processed in this iteration.
    var  currentNumericValue = numericDataset[entryIndex] ;
    var  tallyCounter = 0 ;  // Initialize a counter for the computed items.

    // If the current value is zero, it signifies an end condition,
    // so the processing loop is exited prematurely.
    if (currentNumericValue == 0) {
        break ;
    }

    // Adjust the current numeric value by subtracting it from a fixed base (1000).
    currentNumericValue = 1000 - currentNumericValue ;

    // Check if the adjusted value is large enough to include a 500-unit item.
    if (currentNumericValue >= 500) {
        tallyCounter++ ;         // Increment the counter.
        currentNumericValue -= 500 ; // Reduce the value by 500.
    }

    // Add the count of 100-unit items that can be extracted from the remaining value.
    tallyCounter += Math.floor(currentNumericValue / 100) ;
    currentNumericValue %= 100 ; // Update the value to its remainder after 100s.

    // Check if the remaining value is large enough to include a 50-unit item.
    if (currentNumericValue >= 50) {
        tallyCounter++ ;         // Increment the counter.
        currentNumericValue -= 50 ;  // Reduce the value by 50.
    }

    // Add the count of 10-unit items from the current remainder.
    tallyCounter += Math.floor(currentNumericValue / 10) ;
    currentNumericValue %= 10 ; // Update the value to its remainder after 10s.

    // Check if the remaining value is large enough to include a 5-unit item.
    if (currentNumericValue >= 5) {
        tallyCounter++ ;         // Increment the counter.
        currentNumericValue -= 5 ;   // Reduce the value by 5.
    }

    // Output the final result, which is the sum of the tallied items
    // and any remaining fractional value.
    console.log(tallyCounter + currentNumericValue) ;
}