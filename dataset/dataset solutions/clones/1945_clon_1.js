// This JavaScript code processes a list of strings to count unique entries.

  const Main = ( input ) =>    {

      // Split the entire input string by newline characters into an array of strings.
      const S_list = input . split ( '\n' ) ;

      // The first element of the S_list is expected to be a number (N).
      // Convert it to a Number type and remove it from the array.
      const N = Number ( S_list . shift ( ) ) ;

      // Create a new Set data structure from the remaining elements in S_list.
      // Sets automatically store only unique values, effectively removing duplicates.
      const set = new Set ( S_list ) ;

      // Output the size of the Set, which represents the count of unique strings.
      console . log ( set . size ) ;

      /*
       * The following block is a commented-out section of code.
       * It represents an alternative, more manual method to count unique elements
       * which was presumably replaced by the more efficient Set-based approach.
       *
       * let count = 0; // Initialize a counter variable.
       *
       * if ( N === 1 ) {
       *   count = 1; // If N is 1, there's only one item, so it's unique.
       * } else {
       *   // Loop through the list from end to beginning.
       *   for ( let i = N - 1 ; i >= 0 ; i-- ) {
       *     // Check if the current element is not found later in the list.
       *     // The 'i + 1' argument to includes() starts the search from the next element.
       *     if ( ! S_list . includes ( S_list[i] , i + 1 ) ) {
       *       count++; // If it's unique in the remaining part, increment count.
       *     }
       *   }
       * }
       *
       * console . log ( count ) ; // Log the result from this manual counting method.
       */

  } ; // End of the Main function definition.


  // This line executes the Main function.
  // It reads content from standard input ('/dev/stdin') using Node.js's 'fs' module.
  // The content is read as UTF-8 and passed directly to the Main function.
  Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


  // Below are several commented-out example invocations.
  // These are useful for local testing without needing '/dev/stdin'.
  // Main ( `3\napple\norange\napple` ) ; // Example 1: Basic unique count.
  // Main ( `5\ngrape\ngrape\ngrape\ngrape\ngrape` ) ; // Example 2: All identical items.
  // Main ( `4\naaaa\na\naaa\naa` ) ; // Example 3: Varying length strings.
  // End of example calls.