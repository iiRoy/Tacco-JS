/*
 * This JavaScript code defines a main function to process input
 * and simulate a stock trading strategy.
 * It reads a series of stock prices and calculates the maximum
 * profit achievable by buying low and selling high.
 */
function Main( input )
{
  // First, process the raw input string.
  //   - Trim leading/trailing whitespace.
  //   - Split into lines based on newline characters.
  //   - Map each line to an array of strings by splitting on spaces.
  input   =   input.trim()
                   .split( "\n" )
                   .map( function( x ) {
                                         return x.split( " " )
                                       }
                       )
  ;


  // The first line of input (input[0][0]) is N,
  // which represents the number of stock prices.
  // We parse it as an integer.
  let N = parseInt( input[0][0], 10 )
  ;


  // The second line of input (input[1]) contains the stock prices.
  // We map each element to an integer.
  let v_A = input[1].map( e => parseInt( e, 10 ) )
  ;


  // Initialize an index for iterating through the stock prices.
  let i = 0
  ;

  /*
   * This loop processes the `v_A` array to remove consecutive duplicate prices.
   * If v_A[i] is equal to v_A[i + 1], it means the price hasn't changed,
   * so we remove the duplicate at `i + 1`.
   * Otherwise, we move to the next distinct price.
   */
  while
    ( v_A[i] != null )
  {
    if
      ( v_A[i] === v_A[i + 1] )
    {
      // If current price is same as next, remove the next one.
      v_A.splice( i + 1, 1 )
      ;
    }
    else
    {
      // If prices are different, move to the next price.
      i ++
      ;
    }
  }


  // Initialize a flag to track if we currently hold stock (1) or not (0).
  let upDown = 0
  ;

  // Variable to store the number of shares currently held.
  let tmpKabu
  ;

  // Variable to store the current amount of money.
  // We start with 1000 units of currency.
  let tmpMoney = 1000
  ;


  // Optional: Debugging line to see the processed stock prices.
  // console.log(v_A);


  /*
   * This is the main trading simulation loop.
   * It iterates through the stock prices to find optimal buy/sell points.
   * The strategy is to buy when the price is expected to go up (v_A[j] < v_A[j+1])
   * and sell when the price is expected to go down (v_A[j] >= v_A[j+1]).
   * We iterate up to the second-to-last element because we compare j with j+1.
   */
  for
    ( let j = 0 ; j < v_A.length - 1 ; j++ )
  {
    // Optional: Debugging line to see the upDown state.
    // console.log("ud", upDown);

    // Check if the price is expected to rise (current price < next price).
    if
      ( v_A[j] < v_A[j + 1] )
    {
      // If we are not currently holding stock (upDown === 0),
      // this is a potential buying opportunity.
      if
        ( upDown === 0 )
      {
        // Buy as many shares as possible at the current price v_A[j].
        // The `| 0` is a bitwise OR operator used here for integer truncation.
        tmpKabu = ( tmpMoney / v_A[j] | 0 )
        ;

        // Calculate remaining money after buying.
        tmpMoney %= v_A[j]
        ;

        // Optional: Debugging line to see current money and shares.
        // console.log(tmpMoney, tmpKabu);
      }

      // Set the flag to indicate we are now holding stock (or expecting price to rise).
      upDown = 1
      ;
    }
    else
    {
      // If the price is expected to fall or stay the same (current price >= next price).
      // If we are currently holding stock (upDown === 1),
      // this is a potential selling opportunity.
      if
        ( upDown === 1 )
      {
        // Sell all held shares at the current price v_A[j].
        tmpMoney += tmpKabu * v_A[j]
        ;

        // Reset shares held to zero after selling.
        tmpKabu = 0
        ;

        // Optional: Debugging line to see current money and shares.
        // console.log(tmpMoney, tmpKabu);
      }

      // Set the flag to indicate we are not holding stock (or expecting price to fall/stabilize).
      upDown = 0
      ;
    }
  }


  // After the loop, if we are still holding stock (upDown === 1),
  // we sell all remaining shares at the last available price.
  if
    ( upDown === 1 )
  {
    tmpMoney += tmpKabu * v_A[v_A.length - 1]
    ; // Sell remaining shares at the final price.
  }


  // Output the final amount of money.
  console.log( tmpMoney )
  ;
}


// Read input from stdin using Node.js file system module.
// The "utf8" encoding ensures proper character handling.
Main( require( "fs" )
               .readFileSync( "/dev/stdin", "utf8" )
    )
;