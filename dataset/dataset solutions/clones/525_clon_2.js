/* Script to compute a complex minimum value based on input data. */
var sourceData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Prepare raw input by removing leading/trailing whitespace and splitting into lines.
var inputLines = sourceData . trim ( ) . split ( "\n" ) ;

// Parse the first line to get essential configuration parameters.
var configurationNumbers = inputLines . shift ( ) . split ( " " ) . map ( Number ) ;

// Assign parsed parameters to descriptive variables.
var maxIndex = configurationNumbers [ 0 ] - 1 ; // Adjusted maximum index for calculations.
var elementCount = configurationNumbers [ 1 ] ; // Total count of items to be processed.
var targetValue = configurationNumbers [ 2 ] ; // The specific value to target in calculations.

var collectedNumbers = [ ] ; // An array to hold filtered numerical data points.

// Iterate to populate the 'collectedNumbers' array from subsequent input lines.
for ( var loopIndex = 0 ; loopIndex < elementCount ; loopIndex ++ ) {
   var currentNumber = inputLines . shift ( ) - 0 ; // Convert string to a numerical type.
   // Only include numbers that are different from the target value.
   if ( currentNumber !== targetValue ) {
      collectedNumbers . push ( currentNumber ) ;
   }
}

// Add the target value itself to the collection to ensure its presence.
collectedNumbers = collectedNumbers . concat ( targetValue ) ;

// Sort the collected numbers in ascending numerical order.
collectedNumbers . sort ( function ( firstNum , secondNum ) {
    return firstNum - secondNum ;
} ) ;

// Initialize the variable that will store the overall minimum result with a very large number.
var finalMinimum = Infinity ;

// Iterate through each number in the sorted collection to calculate potential minimums.
collectedNumbers . forEach ( function ( itemValue , itemIndex ) {

    // Scenario 1: Current item's value is strictly less than the target value.
    if ( itemValue < targetValue ) {
        if ( itemIndex !== 0 ) {
            // Calculation involving the previous element in the array.
            finalMinimum = Math . min ( finalMinimum , ( targetValue - itemValue ) * 2 + ( maxIndex - targetValue + 1 ) + collectedNumbers [ itemIndex - 1 ] ) ;
        } else {
            // Calculation specifically for the first element in the array.
            finalMinimum = Math . min ( finalMinimum , ( targetValue - itemValue ) * 2 + ( maxIndex - targetValue + 1 ) ) ;
        }
    }

    // Scenario 2: Current item's value is exactly equal to the target value.
    if ( targetValue === itemValue ) {
        if ( itemIndex === 0 ) {
            // Special calculation if the target is the very first element.
            finalMinimum = Math . min ( finalMinimum , collectedNumbers [ collectedNumbers . length - 1 ] - itemValue ) ;
        }
        if ( itemIndex === collectedNumbers . length - 1 ) {
            // Special calculation if the target is the very last element.
            finalMinimum = Math . min ( finalMinimum , itemValue - collectedNumbers [ 0 ] ) ;
        }
        if ( itemIndex !== collectedNumbers . length - 1 ) {
            // Calculation involving the next element in the array.
            finalMinimum = Math . min ( finalMinimum , targetValue + maxIndex - collectedNumbers [ itemIndex + 1 ] + 1 ) ;
        }
        if ( itemIndex !== 0 ) {
            // Calculation involving the previous element in the array.
            finalMinimum = Math . min ( finalMinimum , maxIndex - targetValue + 1 + collectedNumbers [ itemIndex - 1 ] ) ;
        }
    }

    // Scenario 3: Current item's value is strictly greater than the target value.
    if ( targetValue < itemValue ) {
        if ( itemIndex !== collectedNumbers . length - 1 ) {
            // Calculation involving the next element in the array.
            finalMinimum = Math . min ( finalMinimum , ( itemValue - targetValue ) * 2 + targetValue + ( maxIndex - collectedNumbers [ itemIndex + 1 ] + 1 ) ) ;
        } else {
            // Calculation specifically for the last element in the array.
            finalMinimum = Math . min ( finalMinimum , ( itemValue - targetValue ) * 2 + targetValue ) ;
        }
    }

} ) ;

// Output the final computed minimum value, scaled by a factor of 100.
console . log ( finalMinimum * 100 ) ;