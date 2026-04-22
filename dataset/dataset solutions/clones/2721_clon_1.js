/*
 * This JavaScript code processes input data according to a specific algorithm.
 * It simulates a sequence of operations on an array and detects cycles.
 */

function Main ( input ) {
  // The primary function to execute the program logic.
  // It takes the raw input string as its argument.

  // First, split the entire input string by newline characters.
  // This separates different lines of input data.
  input = input . split ( "\n" ) ;

  // Process the first line of input to get N and K.
  // Split the first line by spaces to get individual values.
  input1 = input [ 0 ] . split ( " " ) ;

  // N represents the total number of elements.
  const N = parseInt ( input1 [ 0 ] ) ; // Convert the string to an integer.

  // K represents the number of iterations or steps to perform.
  const K = parseInt ( input1 [ 1 ] ) ; // Convert the string to an integer.

  // The second line of input contains the array elements (As).
  // Split this line by spaces to get the array of strings.
  const As = input [ 1 ] . split ( " " ) ;

  // 'filtered' will store the currently processed sequence of elements.
  // This array changes dynamically based on the algorithm rules.
  var filtered = [ ] ;

  // 'results' will store the state of 'filtered' after each major iteration.
  // It's initialized with an empty string to handle edge cases or initial state.
  var results = [ "" ] ;


  // This is the main loop, iterating K times as specified by the problem.
  for ( i = 0 ; i < K ; i ++ ) {
    // Inner loop: Iterate through each element in the 'As' array.
    for ( j = 0 ; j < N ; j ++ ) {
      // Check if the current element As[j] is already present in 'filtered'.
      if ( filtered . indexOf ( As [ j ] ) != -1 ) {
        // If found, this means we've encountered a cycle within the 'filtered' sequence.
        // Get the index of the first occurrence of As[j].
        var id = filtered . indexOf ( As [ j ] ) ;

        // Truncate 'filtered' up to (but not including) the found element.
        // This effectively removes the part of the sequence that formed the cycle.
        filtered = filtered . slice ( 0 , id ) ;
      } // End of if block for element found.
      else {
        // If the element As[j] is not found in 'filtered', add it.
        // This extends the current sequence.
        filtered . push ( As [ j ] ) ;
      } // End of else block for element not found.
    } // End of inner loop (j).

    // After processing all elements of 'As' for the current iteration (i),
    // check if the current state of 'filtered' (joined as a string)
    // has been seen before in 'results'.
    if ( results . indexOf ( filtered . join ( " " ) ) == -1 ) {
      // If this state is new, add it to 'results'.
      // This helps in detecting cycles in the overall process.
      results . push ( filtered . join ( " " ) ) ;
    } // End of if block for new state.
    else {
      // If this state has been seen before, it means a cycle has been detected
      // in the sequence of 'filtered' states.
      // We can break out of the main loop because the future states will repeat.
      break ; // Exit the main loop.
    } // End of else block for repeated state.
  } // End of main loop (i).


  // After the loops, determine the starting point of the detected cycle.
  // This is the index in 'results' where the final 'filtered' state was first seen.
  const roopstart = results . indexOf ( filtered . join ( " " ) ) ;

  // Check if the loop completed all K iterations without detecting a cycle
  // that broke the loop early.
  if ( roopstart == K ) {
    // If roopstart is equal to K, it means the loop ran K times,
    // and the K-th state (at index K in 'results' due to initial empty string)
    // is the one we need.
    // In this case, the final state of 'filtered' is the answer.
    console . log ( results [ roopstart ] ) ;
  } // End of if block for full K iterations.
  else {
    // If a cycle was detected (roopstart < K), we need to calculate
    // which state in the cycle corresponds to the K-th iteration.

    // Calculate the length of the cycle.
    // results.length is the total number of unique states observed until the cycle was found.
    // roopstart is the index where the cycle begins.
    const cycleLength = results . length - roopstart ;

    // Calculate the effective iteration count within the cycle.
    // (K - roopstart) gives how many more steps are needed from the cycle start.
    // Modulo cycleLength gives the position within the cycle.
    const roopId = ( K - roopstart ) % cycleLength ;

    // The final result is the state at 'roopstart + roopId'.
    // This correctly identifies the K-th state considering the cycle.
    console . log ( results [ roopstart + roopId ] ) ;
  } // End of else block for cycle detected.
} // End of Main function definition.


// This line reads input from standard input and passes it to the Main function.
// It's common in competitive programming environments for JavaScript.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/* End of file. */