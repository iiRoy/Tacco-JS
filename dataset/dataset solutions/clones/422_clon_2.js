function locateValue ( dataCollection ,  lookupKey ) {
  // This function performs a binary search operation on a sorted array.
  var lowerBound = 0 ; // Initialize the starting index for the search range.
  var upperBound = dataCollection . length ; // Set the ending index for the search range.
  var stepCounter = 0 ; // Variable to keep track of the number of iterations or comparisons made.

  while ( true )
  {
    stepCounter ++ ; // Increment the operation counter with each loop cycle.

    if ( lowerBound > upperBound ) {
      break ; // Exit the loop if the lower bound exceeds the upper bound, indicating the element is not found.
    }

    var pivotPoint = Math . floor ( ( lowerBound + upperBound ) / 2 ) ; // Calculate the middle index of the current search range.

    if ( dataCollection [ pivotPoint ] === lookupKey ) {
      return stepCounter ; // If the element at the pivot point matches the lookup key, return the total steps.
    }

    if ( lookupKey < dataCollection [ pivotPoint ] ) {
      upperBound = pivotPoint ; // If the lookup key is smaller, narrow the search to the left half.
    }
    else {
      lowerBound = pivotPoint + 1 ; // Otherwise, narrow the search to the right half.
    }
  }

  return stepCounter ; // Return the final step count if the element was not found in the array.
}

// Main program execution starts here.
// It reads input from standard input, processes multiple test cases, and outputs search results.
var fileContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read all raw input from the specified file path.
var inputLines = fileContent . trim ( ) . split ( "\n" ) ; // Clean up the input and split it into an array of individual lines.

while ( true )
{
  var numElements = inputLines . shift ( ) - 0 ; // Extract the number of elements for the current test case, converting it to a number.

  if ( numElements === 0 ) {
    break ; // If the number of elements is zero, it signifies the end of input, so terminate the loop.
  }

  var currentDataSet = [ ] ; // Initialize an empty array to store the elements for the current test case.

  for ( var idx = 0 ; idx < numElements ; idx ++ ) {
    currentDataSet . push ( inputLines . shift ( ) - 0 ) ; // Populate the current data set with elements from input, converting them to numbers.
  }

  // Call the search function with the current data set and the target value (also converted to a number).
  // Then, print the result (the number of steps taken) to the console.
  console . log ( locateValue ( currentDataSet , inputLines . shift ( ) - 0 ) ) ;
}