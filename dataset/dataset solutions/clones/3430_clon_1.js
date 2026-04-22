/* This is the main function definition.
 * It takes one argument: 'input'.
 */
function Main ( input )
{
  // The input string is processed to extract the first line and convert it to a number.
  input = ~~ input . split ( "\n" ) [ 0 ] ;

  // Define an array of allowed digits.
  var arr = [ "0", "3", "5", "7" ] ;

  // Initialize a counter for valid numbers.
  var count = 0 ;

  // Start of a deeply nested loop structure.
  // This structure generates all possible combinations of 9 digits
  // using only the digits from the 'arr' array.
  for ( var a of arr )
  {
    for ( var b of arr )
    {
      for ( var c of arr )
      {
        for ( var d of arr )
        {
          for ( var e of arr )
          {
            for ( var f of arr )
            {
              for ( var g of arr )
              {
                for ( var h of arr )
                {
                  for ( var i of arr ) // Innermost loop for the ninth digit.
                  {
                    // Combine the 9 digits into an array.
                    var hoge = [ a, b, c, d, e, f, g, h, i ] ;

                    // Convert the array of digits to a number string, then back to an array of digits.
                    // This effectively removes leading zeros and handles empty strings gracefully.
                    hoge = ( "" + ~~ ( hoge.join ( "" ) ) ) . split ( "" ) ;

                    // Skip combinations that result in fewer than 3 digits after processing (e.g., "000" becomes "0").
                    if ( hoge.length < 3 )
                    {
                      continue ;
                    }

                    // Skip combinations that contain the digit '0'.
                    if ( hoge.find ( ( j ) => j == 0 ) !== undefined )
                    {
                      continue ;
                    }

                    // Check if the combination contains all required digits: '3', '5', and '7'.
                    if ( hoge.find ( ( j ) => j == 3 ) && hoge.find ( ( j ) => j == 5 ) && hoge.find ( ( j ) => j == 7 ) )
                    {
                      // Convert the current valid digit combination back to an integer.
                      var value = ~~ hoge.join ( "" ) ;

                      // If the generated value exceeds the input limit, return the current count.
                      if ( value > input )
                      {
                        return count ;
                      }

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

  // Return the final count of valid numbers found.
  return count ;
}

// This self-executing anonymous function handles the execution environment.
(
  ( b, c, d ) =>
    "undefined" != typeof require // Check if running in Node.js environment.
      ? console.log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) // If Node.js, read from stdin and log the result.
      : [
          // If not Node.js (e.g., browser environment), prepare for display.
          b = b . split ( "\n" ) . slice ( 1, -1 ) . join ( "\n" ), // Process input for browser display.
          c = function ( )
          {
            try
            {
              return Main ( b ) ; // Attempt to run Main function.
            }
            catch ( f )
            {
              return f . stack || f . message ; // Catch and display errors.
            }
          } ( ), // Immediately invoke the function to get the result or error.
          d = typeof c, // Determine the type of the result.
          "string" == d || ( c = JSON.stringify ( c ) ), // If not a string, convert result to JSON string.
          $ ( "<form>" ) . append ( // Create a form element.
            [
              [ 10, b ], // Input data textarea.
              0, // Line break.
              [ 1, d ], // Result type textarea.
              0, // Line break.
              [ 10, c ] // Result data textarea.
            ] . map ( f => $ ( f ? "<textarea>" : "<br>" , f && { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } ) ) // Map data to textarea or br elements.
          ) . appendTo ( "body" ) // Append the form to the document body.
        ]
) (
  `
999999999
`
) ; // The initial input for the browser environment.