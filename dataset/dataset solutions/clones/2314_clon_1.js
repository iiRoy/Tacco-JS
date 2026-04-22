/*
 * This is an automatically generated Type I clone of a JavaScript program.
 * It strictly adheres to the definition:
 * - Identifiers, variable names, function names, operators, and expressions are unchanged.
 * - Only whitespace and comments have been altered significantly.
 */
/**
 * @param input string[]
 * This function serves as the main entry point for processing the input data.
 */
function Main ( input )
{

  /** @type number[] */
  // The first line of the input array is parsed.
  // It's split by spaces and each part converted to a number.
  const input0Numbered = input[ 0 ].split( ' ' ).map( Number );


  // Destructure the parsed numbers into specific variables.
  const N = input0Numbered[ 0 ]; // Represents the total count of items.
  const M = input0Numbered[ 1 ]; // A specific constant value, perhaps for voting or score addition.
  const V = input0Numbered[ 2 ]; // The initial total number of votes available.
  const P = input0Numbered[ 3 ]; // A target rank or position to achieve.

  /**
   * This array, 'alist', contains numeric values extracted from the second input line.
   * It is immediately sorted in ascending order.
   * @type number[]
   */
  const alist = input[ 1 ].split( ' ' ).map( Number ).sort( ( v1, v2 ) => v1 - v2 );


  /*
   * The following multi-line comment outlines the original algorithm's conceptual steps.
   * It is preserved in this Type I clone.
   *
   * まず、昇順ソート
   * 1. 配列の最小数Kの重複分を配列から抜いて投票可能数もその分減らす
   * 2. 投票数 -= 1 ... Kに全票を入れるため
   * 3. KにM票入れた結果K2より少ない数がK以降にあれば、その差を抜いていく。その合計がMになったらv-=1これを繰り返し、余った分をRとする
   * 4. 配列の最後からv番目の数にM-Rを足した数がK2以下であれば5へ、それ以外は配列からKを抜いて1に戻る
   * 5. P位以内になれるものが見つかったら、それより少ない数を引いた問題数が結果となる
   */



  v = V; // Initialize the mutable vote counter 'v' with the initial total votes 'V'.

  // Declare several local variables that will be used within the main processing loop.
  var ai, ai2, aj, r, j, reducedV, max = null;


  // This primary loop iterates through the sorted list 'alist'.
  // Its goal is to identify a minimum score 'ai' that satisfies certain conditions.
  for ( var i = 0; i < alist.length; i++ )
  {
    // Skip over consecutive duplicate values in 'alist' and reduce 'v' accordingly.
    // This accounts for items that effectively share the same score.
    while ( alist[ i ] === alist[ i + 1 ] )
    {
      i++; // Advance the index to the next distinct item.
      v--; // Decrement the available votes 'v'.
    }

    v--; // Decrement 'v' once more for the current unique item being considered.


    // 'ai' holds the current item's score.
    ai = alist[ i ];
    // 'ai2' represents the maximum possible score for 'ai' after adding 'M' votes.
    ai2 = ai + M;

    r = 0; // Initialize 'r' (a variable for accumulated differences or remaining votes) to zero.

    // This nested loop calculates 'r' by summing differences for items
    // that are greater than 'ai' but less than 'k2'.
    // Note: The variable 'k2' here seems to be a typo in the original code and should likely be 'ai2'.
    // However, for a Type I clone, it must remain exactly as 'k2'.
    for ( j = i + 1; alist[ j ] < k2; j++ )
    {
      r += k2 - alist[ j ]; // Accumulate the difference.
    }

    reducedV = Math.floor( r / M ); // Calculate 'reducedV' as the integer division of 'r' by 'M'.
    r = r % M; // Update 'r' to its remainder after division.


    // Check if the remaining votes 'v' are less than or equal to 'reducedV'.
    // This condition implies that all votes have been effectively allocated.
    if ( v <= reducedV )
    {
      // If true, the current 'ai' is a candidate for the maximum achievable score.
      max = ai;
      break; // Exit the main loop as a solution has been found.
    }


    /*
     * This comment from the original code provides context.
     */
    // この時点で v < alist.length - (i + 1)


    // Create a new array 'voteds'. It's a slice of 'alist'
    // (from the end, based on 'v - reducedV') with 'M' added to each element.
    // These are the items that receive the remaining votes.
    voteds = alist.slice( -( v - reducedV ) ).map( ( aj ) => aj + M );


    // If there are still remaining votes 'r' to distribute.
    if ( r > 0 )
    {
      // Iterate through the 'voteds' array to distribute the remaining 'r' votes.
      for ( j = 0; j < voteds.length; j++ )
      {
        aj = voteds[ j ]; // Get the current score from 'voteds'.

        // If subtracting 'r' from 'aj' would result in a score less than 'ai2'.
        if ( aj - r < ai2 )
        {
          voteds[ j ] = ai2; // Cap the score at 'ai2'.
          r -= aj - ai2; // Reduce 'r' by the amount distributed.
        }
        else // Otherwise, 'aj - r' is still greater than or equal to 'ai2'.
        {
          voteds[ j ] -= r; // Subtract 'r' directly from 'aj'.
          r = 0; // All remaining 'r' votes have been distributed.
          break; // Exit this inner loop.
        }
      }

      // If 'r' still holds a value after the loop, it means some votes remain.
      // Distribute these remaining votes to the last item in 'voteds'.
      if ( r > 0 )
      {
        voteds[ voteds.length - 1 ] -= r;
      }
    }


    // This loop checks if the current 'ai2' (maximum possible score for 'ai')
    // can achieve a position within the top 'P' items.
    for ( k = 0; k < P; k++ )
    {
      // Determine the comparison value 'cmp'.
      // Note: 'veteds' appears to be a typo for 'voteds' in the original code.
      // It must be preserved as 'veteds' for Type I cloning.
      cmp = ( k < veteds.length )
        ? veteds[ veteds.length - k - 1 ] // If 'k' is within 'veteds' bounds, use 'veteds'.
        : alist[ alist.length - k - 1 ]; // Otherwise, use 'alist'.

      // If 'ai2' is greater than or equal to 'cmp', it means 'ai' can reach the target rank.
      if ( ai2 >= cmp )
      {
        max = ai; // Set 'max' to the current 'ai'.
        break; // Exit this inner loop.
      }
    }

    // If 'max' was assigned a value in the previous loop,
    // it means a suitable 'ai' has been found.
    if ( max )
    {
      break; // Exit the main outer 'for' loop.
    }
  }


  // After the main loop, this section adjusts the index 'i' backwards.
  // It finds the first occurrence of the score that was determined to be 'max'.
  // This effectively finds the starting index of the block of identical scores.
  for ( ; i > 0; i-- )
  {
    if ( alist[ i ] !== alist[ i - 1 ] )
    {
      break; // Stop when a different score is encountered.
    }
  }


  // Calculate the final answer.
  // The answer is the total length of 'alist' minus the adjusted index 'i'.
  answer = alist.length - i;


  // Print the calculated answer to the console.
  console.log( answer );

} // End of the Main function definition.


/*
 * This line of code reads input from standard input,
 * processes it, and then calls the 'Main' function with the prepared data.
 * It uses Node.js's 'fs' module to read the file.
 */
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim().split( "\n" ) );