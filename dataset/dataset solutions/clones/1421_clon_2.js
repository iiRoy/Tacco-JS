/*
 * This self-executing function processes incoming text.
 * It inverts the case of all alphabetic characters.
 */
( function ( initialText ) {
  // Declare a mutable variable to hold the string content.
  let modifiedString = initialText ;

  // Apply a regular expression replacement to flip character cases.
  // The regex captures either a lowercase letter (p1) or an uppercase letter (p2).
  modifiedString = modifiedString . replace(
    /(?:([a-z])|([A-Z]))/g, // Regex pattern to find any single letter, case-insensitive
    function ( entireMatch, lowerChar, upperChar, matchPosition, sourceText ) {
      // Check if the first capturing group (lowercase letter) has a value.
      if ( lowerChar ) {
        // If it's a lowercase letter, convert it to uppercase.
        return lowerChar . toUpperCase();
      }
      // Otherwise, it must be an uppercase letter (captured by the second group),
      // so convert it to lowercase.
      return upperChar . toLowerCase();
    }
  );

  // Output the final, case-inverted string to the standard console.
  console . log( modifiedString );
// Immediately invoke the function with content read from standard input.
} ) ( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ) ;