var rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8') ;

// This script processes data from standard input to calculate a specific minimum value.
// It reads configuration parameters and a list of numbers, then performs complex calculations.

var linesArray = rawInputData.trim().split('\n') ; // Split the input into an array of lines after trimming any surrounding whitespace.

// Extract the first line, split it by space, and convert parts to numbers.
var configParams = linesArray.shift().split(' ').map(Number) ;

// Assign configuration parameters to descriptive variables for clarity.
var totalLength = configParams[0] ;
var numItems = configParams[1] ;
var specialPosition = configParams[2] ;

// Initialize an array to store relevant values identified during processing.
var collectedValues = [ ] ;

// Loop through a specified number of items from the input lines.
for (  var idx = 0  ;  idx < numItems  ;  idx++  )
{
   // Parse the current line as a number, using the unary plus operator.
   var currentValue = +(linesArray.shift()) ;

   // If the current value is not identical to the special position, add it to our collection.
   if (currentValue !== specialPosition)
   {
      collectedValues.push(currentValue) ;
   }
}

// After collecting, ensure the special position itself is also part of the set of values.
collectedValues = collectedValues.concat(specialPosition) ;

// Sort the collected values in ascending numerical order using a comparison function.
collectedValues.sort(function (valA, valB) {
   return valA - valB ;
}) ;

// Initialize the minimum calculated value to a very large number (positive infinity)
// to ensure any valid calculation will be smaller.
var calculatedMin = Infinity ;

// Iterate over each value in the sorted collection, along with its index,
// to find the minimum distance based on various conditions.
collectedValues.forEach(function (itemValue, itemIndex)
{
   // Condition 1: The current item's value is strictly less than the special position.
   if (itemValue < specialPosition)
   {
      // If it's not the very first element in the array, perform a specific calculation.
      if (itemIndex !== 0)
      {
         calculatedMin = Math.min(calculatedMin, (specialPosition - itemValue) * 2 + (totalLength - specialPosition + 1) + collectedValues[itemIndex - 1]) ;
      }
   }

   // Condition 2: The current item's value is exactly equal to the special position.
   if (specialPosition === itemValue)
   {
      // Sub-condition for when this is the first element.
      if (itemIndex === 0)
      {
         calculatedMin = Math.min(calculatedMin, collectedValues[collectedValues.length - 1] - itemValue) ;
      }
      // Sub-condition for when this is the last element.
      if (itemIndex === collectedValues.length - 1)
      {
         calculatedMin = Math.min(calculatedMin, itemValue - collectedValues[0]) ;
      }
      // Sub-condition for when this is not the last element.
      if (itemIndex !== collectedValues.length - 1)
      {
         calculatedMin = Math.min(calculatedMin, specialPosition + totalLength - collectedValues[itemIndex + 1] + 1) ;
      }
      // Sub-condition for when this is not the first element.
      if (itemIndex !== 0)
      {
         calculatedMin = Math.min(calculatedMin, totalLength - specialPosition + 1 + collectedValues[itemIndex - 1]) ;
      }
   }

   // Condition 3: The current item's value is strictly greater than the special position.
   if (specialPosition < itemValue)
   {
      // If it's not the last element in the array, perform another specific calculation.
      if (itemIndex !== collectedValues.length - 1)
      {
         calculatedMin = Math.min(calculatedMin, (itemValue - specialPosition) * 2 + specialPosition + (totalLength - collectedValues[itemIndex + 1] + 1)) ;
      }
   }
}) ;

// Finally, output the calculated minimum value, scaled by a factor of 100.
console.log(calculatedMin * 100) ;