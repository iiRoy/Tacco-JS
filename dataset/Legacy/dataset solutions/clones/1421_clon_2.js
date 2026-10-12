( function ( initialText ) {
  // Declare a variable to hold the string being processed.
  var processedString = initialText;

  // Apply a transformation to the string:
  // Convert lowercase letters to uppercase and uppercase letters to lowercase.
  // This is achieved by using a regular expression with a replacement function.
  processedString = processedString.replace(
    /(?:([a-z])|([A-Z]))/g, // Regex to match either a lowercase letter (group 1) or an uppercase letter (group 2) globally.
    function ( fullMatch, lowerCaseGroup, upperCaseGroup, matchPosition, originalInputString ) {
      // Check if the first capturing group (lowercase letter) has a value.
      if ( lowerCaseGroup ) {
        // If it's a lowercase letter, convert it to uppercase.
        return lowerCaseGroup.toUpperCase();
      }
      // Otherwise, it must be an uppercase letter (from the second capturing group).
      // Convert it to lowercase.
      return upperCaseGroup.toLowerCase();
    }
  );

  // Output the modified string to the console.
  console.log( processedString );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
