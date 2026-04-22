/* This function serves as the primary entry point for data processing. */
function ProcessInput ( rawData ) {

  // Divide the incoming raw data string into an array of text rows based on newline characters.
  var textRows = rawData . split ( '\n' );

  // Convert the first element of the textRows array to a number, representing the total item count.
  var itemCount = Number( textRows[0] );

  /* Split the second text row into individual string elements, using space as a delimiter. */
  var stringElements = textRows[1] . split ( ' ' );

  // Initialize an empty array that will store numbers.
  var numericValues = [ ];

  // Iterate through the string elements, converting each to a number and adding it to the numericValues array.
  // The loop runs up to 'itemCount - 1' as per the original logic, implying the last element might be a newline or not needed.
  for (var idxA = 0; idxA < itemCount - 1; idxA ++ ) {
    numericValues . push ( Number ( stringElements[idxA] ) );
  }

  // Sort the array of numeric values in ascending order using a custom comparison function.
  numericValues . sort ( function( val1, val2 ) {
    if ( val1 < val2 ) return -1; // If val1 is smaller, it comes first.
    if ( val1 > val2 ) return 1;  // If val1 is larger, it comes after.
    return 0; // If they are equal, their order doesn't change.
  } );

  // Initialize a pointer to keep track of the current position in the sorted numeric array.
  var currentPointer = 0;

  // Declare a variable to store the count of occurrences for each value.
  var occurrenceCount;

  // Loop through a sequence of numbers from 1 up to the total itemCount.
  for ( var currentValue = 1; currentValue <= itemCount; currentValue ++ ) {
    occurrenceCount = 0; // Reset the occurrence counter for each new currentValue.

    // While the element at the currentPointer in numericValues matches the currentValue
    // and the currentPointer is within the bounds of the array, increment the count.
    while ( numericValues[currentPointer] == currentValue && currentPointer < itemCount ) {
      currentPointer ++ ; // Advance the pointer to the next element.
      occurrenceCount ++ ; // Increment the count of the current value.
    }
    console . log ( occurrenceCount ); // Output the final count for the currentValue.
  }
}

// Invoke the main processing function, reading input from standard input.
ProcessInput ( require("fs") . readFileSync("/dev/stdin", "utf8") );