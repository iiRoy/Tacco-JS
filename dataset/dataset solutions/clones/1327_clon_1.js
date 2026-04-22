'use strict'
; /*
 * This JavaScript module processes input from stdin.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its scope and dependencies.
 */

( function ( stdin )
    { // Begin main IIFE block.

        // Read the entire standard input and convert it to a string.
        var lines = stdin . toString ( )
        ; // Semicolon after variable declaration.

        /*
         * Define a regular expression to parse the input.
         * This regex looks for:
         *   - One or more alphabetic characters ([A-Za-z]+)
         *   - Followed by a newline character (\n)
         *   - Then, one or more occurrences of:
         *     - A number that does not start with zero ([1-9][0-9]*)
         *     - Followed by a newline character (\n)
         * The 'g' flag ensures that all matches are found, not just the first.
         */
        var re = /[A-Za-z]+\n([1-9][0-9]*\n)+/g
        ; // Semicolon after regex declaration.

        // The 'result' variable will store the final processed string.
        // Its value is derived from another nested IIFE.
        var result
            = (
                function ( data )
                    { // Begin inner IIFE block, processing 'data'.

                        // The core logic involves mapping over each item in the 'data' array.
                        return data
                               . map ( function ( v )
                                        { // Callback function for the map operation.
                                            /*
                                             * For each item 'v' (which is expected to be an array itself),
                                             * we perform a sequence of transformations.
                                             * `v[0]` is the initial string to be manipulated.
                                             * `v[1]` onwards are numbers indicating cyclic shift amounts.
                                             * `v.slice(-v[1])` extracts the shift numbers from the end of the array `v`.
                                             * Note: `v[1]` here is actually the *count* of shift numbers, not the first shift value.
                                             */
                                            return v . slice ( - v [ 1 ] )
                                                      // Convert the extracted shift values from strings to actual numbers.
                                                      . map ( Number )
                                                      /*
                                                       * Reduce the array of shift numbers, applying each shift
                                                       * sequentially to the accumulating string.
                                                       * `str` is the current state of the string.
                                                       * `num` is the current shift amount.
                                                       */
                                                      . reduce ( function ( str , num )
                                                                  { // Callback function for the reduce operation.

                                                                      // Output the current shift number to console.
                                                                      // This might be for debugging or tracing purposes.
                                                                      console . log ( num )
                                                                      ; // Semicolon after console.log.

                                                                      // Perform a cyclic shift operation on the string 'str'.
                                                                      // It moves the first 'num' characters from the beginning
                                                                      // to the end of the string.
                                                                      return str . slice ( num ) + str . slice ( 0 , num )
                                                                      ; // Semicolon after return.
                                                                  }
                                                                  , // Separator for reduce arguments.
                                                                  v [ 0 ] // The initial value for the reduce operation is `v[0]`, the original string.
                                                                 ) // End of reduce method call.
                                            ; // Semicolon after return statement in map callback.
                                        }
                                      ) // End of map method call.
                               . join ( '\n' ) // After all strings are processed, join them with newline characters.
                        ; // Semicolon after return statement in inner IIFE.
                    }
                // Arguments provided to the inner IIFE:
                (
                    lines . match ( re ) // First, find all matches of the regex in the input 'lines'.
                          . map ( function ( v )
                                    { // Callback function for the map operation on regex matches.
                                        // For each regex match 'v', trim leading/trailing whitespace
                                        // and then split it into an array of lines based on newline characters.
                                        return v . trim ( ) . split ( '\n' )
                                        ; // Semicolon after return statement.
                                    }
                                 ) // End of map method call.
                ) // End of arguments for inner IIFE.
            ) // End of inner IIFE execution.
        ; // Semicolon after 'var result' assignment.

        // Print the final computed 'result' to standard output.
        console . log ( result )
        ; // Semicolon after console.log.

    } // End of main IIFE function body.
    // Arguments provided to the main IIFE:
    ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) // Read content of /dev/stdin synchronously as UTF-8.
) // End of main IIFE execution.
; // Final semicolon for the entire script.