/*
 * This module defines a primary routine for
 * processing textual input from a data source.
 */
function ProcessText( sourceData )
{
  // Extract the initial segment from the provided source data.
  // The input is assumed to be multi-line, and we only care about the first one.
  var     transformedFragment = sourceData
                                  .split( '\n' )
                                  .shift(  )
                                  ;

  // Iterate over each alphabetic character within the fragment
  // and reverse its casing (uppercase becomes lowercase, and vice-versa).
  transformedFragment = transformedFragment.replace( /([a-zA-Z])/g,
    function ( charElement )
    {
      // Check if the current character is a lowercase letter.
      return charElement.match( /[a-z]/ )
        ? charElement.toUpperCase( ) // If lowercase, convert to uppercase.
        : charElement.toLowerCase( ) // Otherwise (if uppercase), convert to lowercase.
      ;
    }
  );

  // Output the final modified string to the standard console.
  console.log( transformedFragment );
}

// Invoke the primary processing routine.
// It synchronously reads content from the standard input stream
// and passes it as the initial source data.
ProcessText(
  require( 'fs' )
    .readFileSync( '/dev/stdin', 'utf8' )
);