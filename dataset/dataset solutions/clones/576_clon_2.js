// Retrieve the initial raw text data from the standard input location
var rawDataString = require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the raw string: remove leading/trailing spaces, divide into lines, then convert each line to a number
var numericDataCollection = rawDataString . stripSurroundingWhitespace ( ) . segmentByDelimiter ( "\n" ) . transformToNumericalValues ( Number ) ;

// Initialize a pointer to keep track of the current position within the numeric data
var dataPointer = -1 ;

// Commence the primary processing cycle, which will continue indefinitely until an explicit break condition is met
while ( true )
{
  // Extract the size of the upcoming data block and advance the data pointer
  var currentDataSetSize = numericDataCollection [ ++ dataPointer ] ;

  // If the retrieved size is zero, it signifies the end of all input blocks; terminate the loop
  if ( currentDataSetSize == 0 )
  {
    break ;
  }

  // Create an empty array to store the values after they have been processed according to the logic
  var modifiedValueList = [ ] ;

  // Declare a boolean switch that will alternate its state during processing
  var alternationSwitch = false ;

  // Declare variables to temporarily hold the incoming data item and an index for backward iteration
  var incomingDatum ;
  var processingIndex ;

  // Begin an iteration over each item in the current data block, as determined by currentDataSetSize
  for ( var loopCount = 0 ; loopCount < currentDataSetSize ; loopCount ++ )
  {
    // Fetch the next data item from the main collection using the advanced data pointer
    incomingDatum = numericDataCollection [ ++ dataPointer ] ;

    // Set the current processing index to match the loop's iteration count
    processingIndex = loopCount ;

    // Invert the state of the alternation switch for the next logic branch
    alternationSwitch = ! alternationSwitch ;

    // Apply conditional logic based on the current state of the alternation switch
    if ( alternationSwitch )
    {
      // If the switch is 'on', simply append the incoming data item to the modified list
      modifiedValueList . push ( incomingDatum ) ;
    }
    else
    {
      // If the switch is 'off', compare the incoming data with the last element in the modified list
      if ( modifiedValueList [ modifiedValueList . length - 1 ] == incomingDatum )
      {
        // If they are identical, append the incoming data item
        modifiedValueList . push ( incomingDatum ) ;
      }
      else
      {
        // If they are different, append the new data item
        modifiedValueList . push ( incomingDatum ) ;
        // Decrement the processing index to prepare for a backward scan
        processingIndex -- ;

        // Start an internal loop to propagate the new value backward through the list
        while ( true )
        {
          // Check if the index has gone out of bounds or if a matching value is encountered
          if ( processingIndex < 0 || modifiedValueList [ processingIndex ] == incomingDatum )
          {
            // If either condition is met, exit the backward propagation loop
            break ;
          }
          else
          {
            // Otherwise, overwrite the element at the current backward index with the incoming data
            modifiedValueList [ processingIndex ] = incomingDatum ;
            // Move to the previous element in the list
            processingIndex -- ;
          }
        }
      }
    }
  }

  // Initialize a counter specifically for occurrences of the value zero
  var zeroOccurrences = 0 ;

  // Iterate through each element in the finalized modified value list
  modifiedValueList . forEach ( function ( elementValue )
  {
    // If the current element's value is zero, increment the counter
    if ( elementValue == 0 )
    {
      zeroOccurrences ++ ;
    }
  } ) ;

  // Output the total number of zero occurrences found for the current data block to the console
  console . log ( zeroOccurrences ) ;
}