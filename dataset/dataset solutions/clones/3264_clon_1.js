/*
 * This JavaScript code processes input data to find the maximum possible "deliciousness score"
 * by selecting a specific number of sushi pieces based on certain criteria.
 * It uses a recursive combination generation approach to explore all valid selections.
 * The input is read from standard input, and the final maximum score is printed.
 */

function   Main  ( input )
{

  // The raw input string is first split into an array of lines.
  input  =  input . split ( "\n" ) ;


  // The first line of input contains two space-separated integers: N and K.
  var   l0   =   input [ 0 ] . split ( " " ) ;

  // N represents the total number of available sushi pieces.
  var   N   =   parseInt ( l0 [ 0 ] ) ;

  // K represents the number of sushi pieces to be selected for a combination.
  var   K   =   parseInt ( l0 [ 1 ] ) ;


  // Declare several variables that will be used as loop counters or for temporary storage.
  // Note: n0, n1, n2 are declared but not fully utilized in the main scope,
  // though n1, n2 are reused as parameters in nested functions.
  var   n ,   n0 ,   n1 ,   n2 ;

  // An array to store structured objects, each representing a sushi piece.
  // Each object will have properties 't' (type) and 'd' (deliciousness).
  var   susi   =   [ ] ;


  // Loop from the second line of input (index 1) up to N lines,
  // parsing each line to create 'neta' objects and adding them to the 'susi' array.
  for   ( n   =   1 ;   n   <=   N ;   n ++ )
  {
    // Split the current line into parts based on spaces.
    var   ln   =   input [ n ] . split ( " " ) ;

    // Create a new empty object to hold the properties of a single sushi piece.
    var   neta   =   { } ;

    // Parse the first part as the type 't' and assign it.
    neta . t   =   parseInt ( ln [ 0 ] ) ;

    // Parse the second part as the deliciousness 'd' and assign it.
    neta . d   =   parseInt ( ln [ 1 ] ) ;

    // Add the newly created 'neta' object to the 'susi' array.
    susi . push ( neta ) ;
  }


  // This line is a commented-out section. It suggests that a sorting step
  // by deliciousness might have been considered or used in a different approach.
  // susi . sort ( function ( a , b ) { return b . d - a . d ; } ) ;


  // Initialize the 'max' variable to keep track of the highest score found.
  var   max   =   0 ;


  /**
   * This function initiates the recursive combination generation process.
   * It sets up the initial state for the `nest0` helper function.
   *
   * @param {number} n1 - The number of items to choose for each combination (K).
   * @param {number} n2 - A parameter used in the recursive loop bounds, derived from N and K.
   *                      Specifically, it is `N - K` from the calling context.
   */
  function   comb2 ( n1 ,   n2 )
  {
    // 'm' is an array used to store the 1-based indices of the current combination.
    // Its size is set to a sufficiently large number (100001) to accommodate indices.
    var   m   =   new   Array ( 100001 ) ;

    // 'nest' represents the starting index for the next element to be picked,
    // ensuring elements are picked in increasing order to avoid duplicate combinations.
    var   nest   =   0 ;

    // 'col' represents the current position (1-based) in the combination array 'm'
    // that is being filled.
    var   col   =   1 ;

    // Call the recursive helper function to generate and evaluate combinations.
    nest0 ( nest ,   col ,   n1 ,   n2 ,   m ) ;
  }


  /**
   * A recursive helper function that generates combinations of 'n1' items
   * from the 'susi' array and calculates a score for each combination.
   * It updates the global `max` variable if a higher score is found.
   *
   * @param {number} nest - The index from which to start selecting the next item.
   * @param {number} col - The current position in the combination array `m` being filled.
   * @param {number} n1 - The total number of items that need to be chosen for a complete combination (K).
   * @param {number} n2 - The value `N - K`, used in calculating the upper bound for index selection.
   * @param {Array<number>} m - The array storing the 1-based indices of the current combination.
   */
  function   nest0 ( nest ,   col ,   n1 ,   n2 ,   m )
  {
    var   i ,   k ; // Declare loop counter variables.

    // This loop iterates through possible indices for the current 'col'-th item
    // of the combination. The upper bound `n2 + col` ensures that there are
    // enough remaining items to complete a combination of `n1` items.
    for   ( i   =   nest   +   1   ;   i   <=   n2   +   col ;   i ++ )
    {
      // Store the selected index 'i' in the 'm' array at the current 'col' position.
      m [ col ]   =   i ;

      // If the current combination is not yet complete (i.e., 'col' is less than 'n1'),
      // recursively call `nest0` to select the next item.
      if   ( n1   !=   col )
      {
        nest0 ( i ,   col   +   1 ,   n1 ,   n2 ,   m ) ;
      }
      else
      {
        // A full combination of 'n1' items has been formed.
        // Now, calculate the score for this specific combination.

        var   d0   =   0 ; // This variable is declared but remains unused in this context.
        var   sum   =   0 ; // Accumulator for the deliciousness values of selected items.
        var   s   =   new   Set ( ) ; // A Set to store unique sushi types to count them efficiently.

        // Iterate through all 'n1' items in the current combination (stored in 'm').
        for   ( k   =   1 ;   k   <=   n1 ;   k ++ )
        {
          var   a   =   m [ k ] ; // Get the 1-based index of the sushi piece.
          s . add ( susi [ a   -   1 ] . t ) ; // Add the type (t) of the sushi piece to the set.
          sum   +=   susi [ a   -   1 ] . d ; // Add the deliciousness (d) to the total sum.
        }

        // Calculate the score 'mm' for this combination:
        // (number of unique types)^2 + total deliciousness.
        var   mm   =   s . size   *   s . size ;
        mm   +=   sum ;

        // Update the global 'max' variable if the current combination's score 'mm' is higher.
        max   =   Math . max ( max ,   mm ) ;
      }
    }
  }


  // Invoke the combination generation process.
  // K is the number of items to choose.
  // N-K is passed as the second parameter, which influences the loop bounds in `nest0`.
  comb2 ( K ,   N - K ) ;


  // After exploring all combinations, print the highest score found to the console.
  console . log ( max ) ;

}

// This line handles reading the input from standard input (usually /dev/stdin)
// and then calls the 'Main' function with the read content.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;