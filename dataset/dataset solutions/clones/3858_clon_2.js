/* This module handles processing a sequence of specific integer values. */
function ProcessNumericSequence( elementsCount )
{
  // Ensure the input argument is treated as an integer.
  elementsCount = ( elementsCount | 0 );

  // A predefined ordered collection of values to be processed.
  var numericValuesList = [ 11, 31, 41, 61, 71, 101, 131, 151, 181, 191, 211, 241, 251, 271, 281, 311, 331, 401, 421, 431, 461, 491, 521, 541, 571, 601, 631, 641, 661, 691, 701, 751, 761, 811, 821, 881, 911, 941, 971, 991, 1021, 1031, 1051, 1061, 1091, 1151, 1171, 1181, 1201, 1231, 1291, 1301, 1321, 1361, 1381 ];

  // Variable to accumulate the formatted string output.
  let finalResultString = "";

  // Loop through the list, appending elements separated by spaces,
  // up to one element before the specified count.
  for ( let currentPosition = 0; currentPosition < elementsCount - 1; currentPosition = ( currentPosition + 1 ) | 0 )
  {
    finalResultString += numericValuesList[ currentPosition ] + " ";
  }

  // Append the last element without a trailing space.
  finalResultString += numericValuesList[ currentPosition ];

  // Display the generated string to the console.
  console.log( finalResultString );
}

// Call the primary processing function with data read from standard input.
ProcessNumericSequence( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );