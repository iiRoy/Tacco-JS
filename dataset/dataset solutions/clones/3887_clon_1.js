'use strict' /* This directive enforces strict mode for the entire script. */


function main (  s  )   {

  /*
   * Process the input string 's'.
   * First, split by newline and take the first line.
   * Then, split that line by space.
   * Finally, map each part to a Number.
   */
  s = s . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( n => Number ( n ) ) ;

  // Extract individual values from the processed array.
  const A = s [ 0 ] ; // Cost of item A
  const B = s [ 1 ] ; // Cost of item B


  const C = s [ 2 ] ; // Cost of a half-pizza (AB combo)

  const X = s [ 3 ] ; // Required number of item A

  const Y = s [ 4 ] ; // Required number of item B


  // Calculate the absolute difference between X and Y, used for remaining items.
  const mod = Math . abs ( X - Y ) ;
  // Determine the minimum of X and Y, indicating how many full AB combos can be made.
  const min = Math . min ( X , Y ) ;

  let answer = 0 ; // Initialize the variable to store the minimum cost.

  /*
   * Decision point: Compare the cost of buying A and B separately versus
   * the cost of two half-pizzas (one full AB combo).
   * If A + B is cheaper or equal to 2*C, it's always better to buy A and B separately.
   */
  if ( ( A + B ) <= ( C * 2 ) ) {
    // Scenario 1: Buying A and B individually is more cost-effective.
    // Calculate total cost by multiplying quantities with individual prices.
    answer = ( A * X ) + ( B * Y ) ;

  }
  else
  {
    // Scenario 2: Two half-pizzas (C*2) are cheaper than or equal to A+B.
    // We need to consider using AB combos.

    /*
     * Sub-decision: Compare the cost of buying remaining A/B individually
     * after forming 'min' AB combos, versus buying all remaining as AB combos.
     * (X - min) * A represents remaining A items if X > Y
     * (Y - min) * B represents remaining B items if Y > X
     * C * mod represents the cost of buying the remaining difference as AB combos.
     */
    if ( ( ( X - min ) * A + ( Y - min ) * B ) <= ( C * mod ) ) {
        // Scenario 2a: It's cheaper to buy 'min' AB combos,
        // and then buy the remaining (X-min) A or (Y-min) B separately.
        answer = ( C * min * 2 ) + ( ( X - min ) * A ) + ( ( Y - min ) * B ) ;
    }
    else
    {
        // Scenario 2b: It's cheaper to buy all items as AB combos.
        // This means buying 2 * max(X, Y) half-pizzas.
        answer = C * Math . max ( X , Y ) * 2 ;
    }
  }

  // Output the calculated minimum cost to the console.
  console . log ( answer ) ;

}

// Read input from /dev/stdin and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;