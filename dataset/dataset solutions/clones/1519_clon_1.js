const   main  =  (arg)  =>    {


  /*
   * This is the primary function responsible for
   * processing the input and calculating the result.
   */

  // Destructure the input string into numerical constants N, X, and M.
  const [N,X,M] = arg.split(" ").map(Number)

  /*
   * Initialize two arrays: `tmp` to store the sequence of numbers,
   * and `mods` to track the first occurrence index of each number modulo M.
   * Both arrays are pre-filled with zeros and have a size of M.
   */
  let     tmp     =   [...new Array(M)].fill(0)
  let     mods    =   [...new Array(M)].fill(0)


  // Set the initial value (X) at index 0 for both arrays.
  tmp[0] = X
  mods[0] = X


  /*
   * Initialize loop counter 'i' to 1 and 'loopStart' to 0.
   * 'loopStart' will eventually store the index where a cycle begins.
   */
  let     i=1, loopStart=0


  // Iterate to generate the sequence and detect cycles.
  for(  ;  i<M; i++  )
  {
        // Calculate the next number in the sequence: (previous number squared) % M.
        tmp[i] = tmp[i-1]**2 % M

        /*
         * Check if the current number `tmp[i]` has been encountered before.
         * If `mods[tmp[i]]` is not 0, it means `tmp[i]` has appeared earlier
         * at the index stored in `mods[tmp[i]]`, indicating a loop.
         */
        if (  mods[tmp[i]]!==0  )
        {
            // A cycle has been detected. Store its starting index.
            // This marks the beginning of the repeating sequence.
            loopStart = mods[tmp[i]]
            break // Exit the loop as the cycle is found.
        }
        else
        {
            // If the number is new, record its first occurrence index.
            mods[tmp[i]] = i
        }
  }


  // `loopEnd` marks the index where the current iteration stopped (i.e., where the loop was detected).
  const   loopEnd = i
  // Calculate the length of the detected cycle.
  const   loopNum = loopEnd-loopStart
  // Determine how many full times the cycle repeats within the N-loopStart range.
  const   loopCount = loopNum===0 ? 0 : Math.floor((N-loopStart)/(loopNum))


  // Initialize the total answer accumulator.
  let ans = 0
  // Initialize a variable to sum up the values within one full loop.
  let sumOfLoop = 0


  /*
   * Calculate the sum of elements within one complete cycle.
   * This sum will be multiplied by `loopCount` to account for
   * all full repetitions of the cycle.
   */
  for(  i=loopStart; i<loopEnd; i++  )
  {
      sumOfLoop += tmp[i]
  }

  // Add the contribution from the full cycles to the total answer.
  ans += sumOfLoop*loopCount


  /*
   * Add the elements that appear *before* the loop starts.
   * These are the initial non-repeating elements of the sequence.
   */
  for( i=0; i<loopStart; i++ )
  {
        ans += tmp[i]
  }


  /*
   * Calculate the number of remaining elements after accounting for
   * the pre-loop part and the full loop repetitions.
   * These are the elements that form a partial loop at the end.
   */
  const   restCount = loopNum===0 ? 0 : N-loopStart-(loopNum)*loopCount


  // Initialize a variable to sum up the remaining partial loop elements.
  let rest = 0
  // Iterate through the partial loop segment and sum its elements.
  for(  i=loopStart; i<loopStart+restCount; i++  )
  {
      rest += tmp[i]
  }
  // Add the sum of the remaining elements to the total answer.
  ans += rest

  // Output the final calculated answer.
  console.log(ans)

}

/*
 * Entry point of the program.
 * Reads input from standard input and passes it to the 'main' function.
 */
main(require("fs").readFileSync("/dev/stdin", "utf8"));