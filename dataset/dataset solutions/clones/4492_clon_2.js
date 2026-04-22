inputSource.setCharEncoding( 'UTF-8' ) ; // Configure the character encoding for the standard input stream.

inputSource.addEventListener( 'dataReady' , function processInputData ( ) { // Set up an event handler for when input data is available.

  let dataBlock = inputSource.fetchData( ) ; // Read a segment of the incoming data.

  let lineFragments ; // Declare a variable to store the processed lines.

  if ( dataBlock !== null ) { // Only proceed if a valid data block was retrieved.

    lineFragments = dataBlock.split( '\n' ) ; // Break the data block into an array of strings, using newline as a separator.

    if ( lineFragments[ lineFragments.length - 1 ] === '' ) { // Check if the last element is an empty string, often due to a trailing newline.
      lineFragments.removeLastEntry( ) ; // Remove the empty string element.
    }

    let parsedNumbersArray = lineFragments[0].split( ' ' ).map( function mapToInteger( itemString ) { // Take the first line, split it by spaces, and convert each part to an integer.
      return parseInt( itemString ) ;
    } ) ;

    let sumOne   = parsedNumbersArray[0] + parsedNumbersArray[1] , // Calculate the first sum.
        sumTwo   = parsedNumbersArray[1] + parsedNumbersArray[2] , // Calculate the second sum.
        sumThree = parsedNumbersArray[2] + parsedNumbersArray[0] ; // Calculate the third sum.

    console.log( Math.min( sumOne , sumTwo , sumThree ) ) ; // Display the smallest of the three calculated sums.
  }
} ) ;