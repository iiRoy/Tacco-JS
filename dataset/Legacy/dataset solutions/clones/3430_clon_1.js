/**
 * This function calculates the count of specific numbers up to a given input.
 * The numbers are formed by concatenating digits from the set {"0", "3", "5", "7"}.
 * A valid number must have at least 3 digits, contain no '0', and include '3', '5', and '7'.
 *
 * @param {string} input - The maximum value to consider, provided as a string.
 * @returns {number} The total count of valid numbers found.
 */
function Main ( input ) {
  // Convert the input string to an integer.
  // The `~~` operator is a fast way to perform a floor division (truncation) on a number.
  input = ~~ input . split ( "\n" ) [ 0 ] ;

  // Define the set of allowed digits for number construction.
  var arr = [ "0" , "3" , "5" , "7" ] ;

  // Initialize a counter for valid numbers.
  var count = 0 ;

  // Nested loops to generate all possible 9-digit combinations using 'arr' digits.
  // This creates numbers like "000000000", "000000003", ..., "777777777".
  for ( var a of arr ) {
    for ( var b of arr ) {
      for ( var c of arr ) {
        for ( var d of arr ) {
          for ( var e of arr ) {
            for ( var f of arr ) {
              for ( var g of arr ) {
                for ( var h of arr ) {
                  for ( var i of arr ) {
                    // Concatenate the current digit combination into an array.
                    var hoge = [ a , b , c , d , e , f , g , h , i ] ;

                    // Join the digits, convert to a number (to remove leading zeros),
                    // then convert back to a string and split into individual digits.
                    // Example: ["0","0","3"] -> "003" -> 3 -> "3" -> ["3"]
                    hoge = ( "" + ~~ ( hoge . join ( "" ) ) ) . split ( "" ) ;

                    // Skip numbers with fewer than 3 digits after leading zero removal.
                    if ( hoge . length < 3 ) continue ;

                    // Skip numbers that contain the digit '0'.
                    // `find` returns the element if found, `undefined` otherwise.
                    if ( hoge . find ( ( j ) => j == 0 ) !== undefined ) continue ;

                    // Check if the number contains digits '3', '5', and '7'.
                    if ( hoge . find ( ( j ) => j == 3 ) && hoge . find ( ( j ) => j == 5 ) && hoge . find ( ( j ) => j == 7 ) ) {
                      // Convert the valid digit array back to an integer.
                      var value = ~~ hoge . join ( "" ) ;

                      // If the generated number exceeds the input limit,
                      // we can stop and return the current count.
                      if ( value > input ) return count ;

                      // Increment the counter for valid numbers.
                      count ++ ;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Return the final count of valid numbers.
  return count ;
}


// This immediately invoked function expression (IIFE) handles input/output
// for both Node.js and browser environments.
( ( b , c , d ) =>
  // Check if 'require' is defined, indicating a Node.js environment.
  "undefined" != typeof require
    ? // Node.js path: Read input from stdin, call Main, and print the result to console.
      console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) )
    : // Browser path: Prepare input and output for display on a web page.
      [
        // Process the initial input string (b) by removing first/last lines and joining.
        b = b . split ( "\n" ) . slice ( 1 , -1 ) . join ( "\n" ) ,
        // Execute the Main function with the processed input and catch any errors.
        c = function ( ) {
          try {
            return Main ( b )
          } catch ( f ) {
            return f . stack || f . message
          }
        } ( ) , // Immediately invoke this error-handling function.
        // Determine the type of the result 'c'.
        d = typeof c ,
        // If 'c' is not a string, convert it to a JSON string.
        "string" == d || ( c = JSON . stringify ( c ) ) ,
        // Create a form element and append various input/output fields.
        $ ( "<form>" ) . append (
          [
            [ 10 , b ] , // Textarea for the input (10 rows).
            0 ,          // A <br> element.
            [ 1 , d ] ,  // Textarea for the type of result (1 row).
            0 ,          // A <br> element.
            [ 10 , c ]   // Textarea for the result itself (10 rows).
          ] . map ( f => // Map over the array to create elements.
            $ ( f ? "<textarea>" : "<br>" , // If 'f' is truthy, create a textarea; otherwise, a <br>.
              f && { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } // Set textarea attributes if 'f' is truthy.
            )
          )
        ) . appendTo ( "body" ) // Append the created form to the document body.
      ]
) (
  // The initial input string passed to the IIFE.
  `
999999999
`
) ;
