( function ( rawData ) {

  // Prepare the input string by removing carriage returns and splitting into individual lines.
  // Declare various auxiliary variables needed for processing.
  var processedLines = rawData.replace( /\r/g, '' ).split( "\n" ),
      auxValue,
      idx,
      totalElements,
      windowSize,
      numberSequence,
      currentSum,
      windowSums,
      greatestSum;

  // Begin an infinite loop to process multiple sets of data until a specific termination condition is met.
  while ( true ) {
    // Initialize arrays for each new data set.
    numberSequence = [ ];
    windowSums = [ ];

    // Read the first line of the current data set, split it by space to get two parameters.
    auxValue = processedLines.shift( ).split( ' ' );
    totalElements = parseInt( auxValue[ 0 ] ); // Parse the first parameter as the total number of elements.
    windowSize = parseInt( auxValue[ 1 ] ); // Parse the second parameter as the size of the sliding window.

    // Check for the termination condition: if both parameters are zero, exit the loop.
    if ( totalElements === 0 && windowSize === 0 ) {
      break;
    }

    // Loop to read 'totalElements' number of integers from the subsequent lines of input.
    for ( idx = 0; idx < totalElements; idx++ ) {
      auxValue = parseInt( processedLines.shift( ) ); // Convert each line to an integer.
      numberSequence.push( auxValue ); // Add the integer to the sequence.
    }

    // Iterate through the number sequence to create sliding windows of 'windowSize'.
    for ( idx = 0; idx <= totalElements - windowSize; idx++ ) {
      currentSum = 0; // Reset sum for each new window.

      // Extract the current window slice and calculate its sum.
      numberSequence.slice( idx, idx + windowSize ).forEach( function ( val ) {
        currentSum += val; // Accumulate values within the current window.
      } );

      windowSums.push( currentSum ); // Store the calculated sum for this window.
    }

    // Initialize 'greatestSum' with the first sum from the 'windowSums' array.
    greatestSum = windowSums.shift( );

    // Iterate through the remaining window sums to find the maximum value.
    windowSums.forEach( function ( currentVal ) {
      if ( currentVal > greatestSum ) {
        greatestSum = currentVal; // Update 'greatestSum' if a larger sum is found.
      }
    } );

    // Output the maximum sum found for the current data set.
    console.log( greatestSum );
  }

} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );