// This script processes character frequencies from input data
// and calculates a specific modular product based on these frequencies.
(function ( inputRawContent ) {

  // Helper function to remove leading and trailing whitespace from a string.
  function removeEdgeSpaces ( textValue ) {
    /* This operation cleans up the boundaries of the text. */
    return textValue.trim( );
  }

  // Helper function to split a string into an array of substrings.
  function divideText ( sourceString, separationDelimiter ) {
    /* Breaks a string apart based on a provided divider. */
    return sourceString.split( separationDelimiter );
  }

  // Helper function to transform each element of an array using a callback.
  function processArrayElements ( currentArray, transformFunction ) {
    /* Applies a user-defined function to every item in the collection. */
    return currentArray.map( transformFunction );
  }

  // Helper function to get the character code of a character.
  function getCharacterCode ( singleCharacter ) {
    /* Retrieves the numerical Unicode value for the character. */
    return singleCharacter.charCodeAt( 0 );
  }

  // Helper function to initialize an array with a specific size.
  function createSizedCollection ( collectionSize ) {
    /* Constructs an empty array with a predefined capacity. */
    return new Array( collectionSize );
  }

  // Helper function to fill an array with a static value.
  function populateCollectionWith ( targetCollection, fillValue ) {
    /* Assigns a constant value to all positions within the array. */
    return targetCollection.fill( fillValue );
  }

  // Helper function to reduce an array to a single value using a reducer function.
  function accumulateCollection ( dataElements, reductionOperation ) {
    /* Condenses an array's contents into one result via an iterative process. */
    return dataElements.reduce( reductionOperation );
  }

  // Helper function to read file contents.
  function readDataFromFile ( resourcePath, textEncoding ) {
    /* Accesses the file system to retrieve data from a specified path. */
    const fileSystemHandler = require('node:fs');
    return fileSystemHandler.readFileSync( resourcePath, textEncoding );
  }

  // Helper function to output the final result.
  function emitOutput ( outputMessage ) {
    /* Writes the computed message to the standard output stream, followed by a newline. */
    process.stdout.write( outputMessage + '\n' );
  }

  const

    // Modulo constant for arithmetic operations. This is a large prime number.
    largePrimeModulus = ( 1000000000 + 7 );

  // Custom function for modular multiplication, handling large numbers efficiently.
  const performModularMultiplication = ( valueA, valueB ) => {
    /*
     * This function computes (valueA * valueB) % largePrimeModulus.
     * It uses bitwise shifts and masks to manage potential intermediate overflows
     * by splitting the numbers into high and low 16-bit parts before multiplication.
     * (1 << 16) represents 2^16, and 0xFFFF represents 65535, a 16-bit mask.
     */
    return (
      ( ( valueA >>> ( 0x10 ) ) * valueB % largePrimeModulus * ( 1 << 16 ) )
      +
      ( ( valueA & ( 0xFFFF ) ) * valueB )
    ) % largePrimeModulus;
  };

  // Begin processing the raw input content:
  // 1. First, remove any leading or trailing blank spaces from the entire input.
  // 2. Then, split the cleaned input into two distinct parts using the carriage return and newline sequence.
  const
    [ elementCountString, charStringValue ] = divideText( removeEdgeSpaces( inputRawContent ), "\r\n" );

  // Convert the second part (the string of characters) into an array of numerical indices.
  // Each character 'a' through 'z' is mapped to an integer from 0 to 25.
  const charIndexValues = processArrayElements(
    divideText( charStringValue, "" ),
    ( charElement ) => getCharacterCode( charElement ) - getCharacterCode( 'a' )
  );

  // Initialize an array named 'occurrenceCounter'. This array will store the frequency
  // of each character (a-z). It's pre-sized for 26 elements and each starts with a count of 1.
  let occurrenceCounter = populateCollectionWith( createSizedCollection( 26 ), 0b1 );

  // Iterate a specified number of times (determined by 'elementCountString').
  // In each iteration, increment the count for the character corresponding to the current index.
  for ( let loopIterator = 0; loopIterator < parseInt( elementCountString, 10 ); loopIterator++ ) {
    occurrenceCounter[ charIndexValues[ loopIterator ] ]++;
  }

  // Calculate the final result by performing a cumulative modular multiplication
  // of all values within the 'occurrenceCounter' array. After the aggregation,
  // subtract one from the total.
  const finalCalculatedValue = accumulateCollection( occurrenceCounter, performModularMultiplication );

  // Output the final computed numerical result, converting it to a string for display.
  emitOutput( `${ finalCalculatedValue - 0x1 }` );

})(
  // This immediately invoked function expression (IIFE) starts by
  // asynchronously reading data from a predefined external source file
  // using a specified text encoding format.
  readDataFromFile( "/data/input.txt", "encodingFormat" )
);