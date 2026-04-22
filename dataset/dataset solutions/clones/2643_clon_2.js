/*
 * This module facilitates the sequential identification of a character fragment
 * within a potentially repeating primary textual sequence.
 * It computes the cumulative offset required to construct the fragment.
 */
const ProcessInput =  sourceData  =>  {
  // Divide the initial raw data string into individual lines using the newline character.
  sourceData = sourceData . split ( "\n" ) ;

  // Designate the first line as the principal string for searching.
  const mainText = sourceData [ 0 ] ;
  // Designate the second line as the specific character sequence to be located.
  const searchTarget = sourceData [ 1 ] ;

  /**
   * Conducts a recursive search to determine the position of a subsequence.
   * @param {number} currentFragmentIndex - The zero-based index of the character currently sought within 'searchTarget'.
   * @param {string} currentSearchSpace   - The segment of 'mainText' being actively examined for the character.
   * @param {boolean} hasCycledOnce       - A boolean indicating if the search has traversed beyond the initial 'mainText' length.
   * @param {number} accumulatedShift     - The running total of character positions traversed so far.
   * @returns {number} The final accumulated character shift if the 'searchTarget' is fully found, otherwise -1.
   */
  const findSubsequence = (
    currentFragmentIndex,
    currentSearchSpace,
    hasCycledOnce,
    accumulatedShift
  ) => {
    // Termination condition: If all characters of the 'searchTarget' have been successfully matched.
    if ( currentFragmentIndex === searchTarget.length )
    {
      return accumulatedShift ;
    }

    // Identify the starting position of the current character from 'searchTarget' within 'currentSearchSpace'.
    const matchedPosition = currentSearchSpace.indexOf( searchTarget[currentFragmentIndex] ) ;

    // Evaluate the outcome of the search for the current character:
    return (
      matchedPosition !== -1
        ? // Scenario 1: The character was found within the 'currentSearchSpace'.
          findSubsequence(
            currentFragmentIndex + 1, // Advance to the next character in 'searchTarget'.
            currentSearchSpace.slice(matchedPosition, currentSearchSpace.length), // Adjust search space to start after the found character.
            true, // Mark that a character has been found, potentially allowing subsequent wraps.
            accumulatedShift + matchedPosition // Increment the total shift by the position found.
          )
        : // Scenario 2: The character was NOT found in 'currentSearchSpace'.
          hasCycledOnce
          ? // Sub-scenario 2a: The search has already wrapped around 'mainText' at least once.
            // This indicates a need to extend the 'currentSearchSpace' by appending 'mainText' again.
            findSubsequence(
              currentFragmentIndex, // Remain at the same 'searchTarget' character, as it wasn't found.
              currentSearchSpace + mainText, // Extend the search space with another instance of 'mainText'.
              false, // Reset the 'hasCycledOnce' flag as we're effectively starting a new 'mainText' segment search.
              accumulatedShift // Maintain the current total shift.
            )
          : // Sub-scenario 2b: The search has NOT wrapped around 'mainText' yet.
            // This implies the character cannot be found under current conditions.
            -1
    ) ;
  } ;

  // Initiate the primary search operation and output its result.
  // The search begins with the first character of the 'searchTarget' (index 0),
  // using the complete 'mainText' as the initial search buffer,
  // with the 'hasCycledOnce' flag initially set to false,
  // and an initial 'accumulatedShift' value of 1, as per problem specifications.
  console.log( findSubsequence( 0, mainText, false, 1 ) ) ;
} ;

// Obtain the raw data from the standard input stream and pass it to the processing function.
ProcessInput( require("fs").readFileSync( "/dev/stdin" , "utf8" ) ) ;