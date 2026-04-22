/*
 * This is a JavaScript program designed to solve a specific problem.
 * It processes input related to items and discount tickets.
 * The goal is to apply discounts to item prices based on a given strategy.
 */
function Main ( input )
{
  // First, split the entire input string by newline characters.
  input = input . split ( "\n" ) ;

  // Process the first line of input to extract initial parameters.
  inputStr = input [ 0 ] . split ( " " ) ;

  /*
   * N represents the total number of items.
   * M represents the total number of discount tickets available for use.
   */
  const N = Number . parseInt ( inputStr [ 0 ] ) ;
  const M = Number . parseInt ( inputStr [ 1 ] ) ;

  // This step involves reading the item prices from the second line of input.
  inputStr = input [ 1 ] . split ( " " ) ;

  // Convert the string representations of item prices into actual integers
  // and store them in the array 'A'.
  var A = inputStr . map ( inputStr => Number . parseInt ( inputStr ) ) ;


  /*
   * The core logic involves applying 'M' discount tickets.
   * The strategy is to continuously apply discounts to the item with the highest price.
   * Initialize a counter 'i' to keep track of the number of tickets already utilized.
   */
  var i = 0 ; // This variable counts the tickets consumed so far.

  // The discount application logic differs depending on whether there's more than one item.
  if ( N > 1 )
  {
    // Continue applying discounts as long as there are tickets left (i < M).
    while ( i < M )
    {
      /*
       * In each iteration, we need to identify the item with the maximum price
       * and its corresponding index within the array 'A'.
       *
       * An alternative way to find the position (commented out in original code):
       * //var posi = A.indexOf(Math.max.apply(null, A));
       */

      var max = Math . max . apply ( null , A ) ; // Determine the highest price among all items.

      // Search for the first occurrence of the maximum price to get its position.
      for ( var posi = 0 ; posi < N ; posi ++ )
      {
        if ( A [ posi ] === max )
        {
          break ; // Once found, exit the loop.
        }
      }


      /*
       * Calculate a temporary value 'tmp' based on the item's price and the
       * sum of all item prices. This 'tmp' indicates how many tickets
       * should ideally be applied in this specific step.
       */
      var ave = A . reduce ( function ( total , data ) { return total + data ; } ) ;
      var tmp = Math . ceil ( A [ posi ] / ave ) ;

      // Ensure that the number of tickets to be used in this step ('tmp')
      // does not exceed the remaining available tickets.
      if ( tmp + i >= M )
      {
        tmp = M - i ; // Adjust 'tmp' to use exactly the remaining tickets.
      }

      // Apply the discount: The selected item's price is divided by 2, 'tmp' times.
      A [ posi ] = Math . floor ( A [ posi ] / Math . pow ( 2 , tmp ) ) ;

      // Update the total count of tickets that have been used.
      i += tmp ;
    }
  }
  else // This 'else' block executes if there is only a single item (N equals 1).
  {
    /*
     * When there's only one item, all 'M' available tickets are applied
     * directly to this single item. Its price is divided by 2 raised to the power of 'M'.
     */
    A [ 0 ] = Math . floor ( A [ 0 ] / Math . pow ( 2 , M ) ) ;
  }

  // After all discounts are applied, calculate the sum of all item prices
  // and output this final sum to the standard console.
  console . log ( A . reduce ( function ( total , data ) { return total + data ; } ) ) ;
}

// The Main function is invoked by reading the entire content of standard input.
// The input is read synchronously using Node.js's 'fs' module and decoded as UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;