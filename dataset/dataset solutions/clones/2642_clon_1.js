/*
 * This JavaScript code snippet is an Immediately Invoked Function Expression (IIFE)
 * designed to solve a specific string manipulation problem.
 * It takes input from standard input, processes it, and then logs the result to the console.
 *
 * The core logic involves finding occurrences of characters from one string ('t')
 * within another string ('s'), potentially wrapping around 's' multiple times.
 *
 * This version is a Type I clone, meaning its functionality and structure are identical
 * to the original, with only variations in whitespace and comments.
 */
console.log( (                                          // Begin the console.log call, wrapping the IIFE's return value.
  (                                                     // Start of the anonymous arrow function's definition.
    args => {                                           // The arrow function takes 'args' as its single parameter.

      /*
       * First, process the input string 'args'.
       * - args.trim() removes any leading or trailing whitespace.
       * - .split`\n` splits the trimmed string into an array of lines using a newline character.
       * - Array destructuring assigns the first line to 's' and the second to 't'.
       */
      const [ s , t ] = args . trim ( ) . split `\n` ;

      // Pre-calculate the lengths of strings 's' and 't' for efficiency in loops.
      const sl = s . length ,
            tl = t . length ;

      // Initialize control variables:
      // 'i': Stores the last found index in string 's'. Initialized to -1 (not found).
      // 'cyc': Counts the number of full cycles through string 's'. Initialized to 0.
      let i   =   -1 ,
          cyc =   0  ;

      /*
       * Main loop: Iterate through each character of string 't'.
       * The label 'T' is used to allow a 'continue' statement to jump directly
       * to the next iteration of this outer loop, bypassing the rest of its body.
       */
      T:
      for ( let j = 0 ; j < tl ; j++ )
      {
        /*
         * Inner loop: Search for the current character t[j] within string 's'.
         * The search starts from 'i + 1' to avoid re-matching the same character
         * and to continue from where the last match left off.
         */
        for ( let k = i + 1 ; k < sl ; k++ )
        {
          // Check if the character at s[k] matches the current target character t[j].
          if ( s [ k ] === t [ j ] )
          {
            i = k ;             // If a match is found, update 'i' to the current index 'k'.
            continue T ;        // Found char, so move to the next char in 't' (outer loop).
          }
        }

        // If the inner loop completes without finding t[j] (i.e., no 'continue T' was executed)...
        // This means t[j] was not found in 's' from index 'i + 1' to 'sl - 1'.
        if ( i === -1 )
        {
          // If 'i' is still -1, it means the very first character of 't' couldn't be found
          // even from the beginning of 's', or a subsequent character couldn't be found
          // even after a full reset. This implies the pattern is impossible.
          return '-1' ; // Return '-1' as per problem specification for impossible patterns.
        }

        // If we reach here, it means t[j] was not found in the *remaining* part of 's'
        // from 'i + 1', but it *might* be found if we start searching from the beginning of 's' again.
        cyc++ ;             // Increment the cycle counter, as we are effectively starting a new pass through 's'.
        i = -1 ;            // Reset 'i' to -1, indicating the next search should start from s[0].
        j-- ;               // Decrement 'j' to re-process the *same* character t[j] in the next iteration
                            // of the outer loop, but this time with 'i' reset to -1.
      }

      /*
       * After the loops complete, all characters of 't' have been successfully matched.
       * Calculate the final result:
       * - cyc * sl: Total length covered by full cycles through 's'.
       * - i + 1: The length covered in the final partial cycle through 's' (from index 0 up to 'i').
       * The result is formatted as a string using a template literal.
       */
      return `${ cyc * sl + i + 1 }` ;
    }
  ) (
    // This is the argument passed to the IIFE.
    // It reads the entire content of '/dev/stdin' as a UTF-8 string.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
  )
) ) ;                                                   // End of console.log call.