// This script initializes standard input processing for a Node.js application.

process . stdin . resume ( ) ; // Activates the standard input stream to listen for data.

process . stdin . setEncoding ( 'utf8' ) ; // Configures the input stream to decode data as UTF-8.

/*
 * This is the primary event listener for incoming data on the standard input.
 * It processes the data chunk received and performs a specific pattern matching task.
 */
process . stdin . on ( 'data' , function ( chunk ) {

  // Splits the incoming 'chunk' of data into an array of 'lines' based on newline characters.
  var lines = chunk . split ( "\n" ) ;

  // Extracts the first line, converts it to a number, and stores it in 'n'.
  var n = lines [ 0 ] * 1 ;

  // Extracts the second line, which is expected to be the 'name' string.
  var name = lines [ 1 ] ;


  // Declares loop iteration variables: 'i' for outer loop, 'j' for inner loop, 'len' for length.
  var i , j , len ;


  // Initializes a counter 'cnt' to keep track of successful matches.
  var cnt = 0 ;


  // This is the main loop, iterating 'n' times for each board to be processed.
  // It starts from index 1, assuming lines[1] is the first board if n=1.
  for ( i = 1 ; i <= n ; i ++ ) {

    // Converts the 'name' string into an array of individual characters.
    var chars = name . split ( '' ) ;

    // Retrieves the current 'board' string from the 'lines' array using the loop index 'i'.
    var board = lines [ i ] ;

    // Declares variables for index calculation, difference, and a boolean flag 'able'.
    var idx , diff , able = false ;

    // Stores the length of the current 'board' for loop boundaries.
    var l = board . length ;

    // This nested loop iterates through different starting 'diff' values for pattern matching.
    for ( diff = 0 ; diff < l ; diff ++ ) {

      // Updates 'len' with the length of the 'chars' array (which is 'name').
      len = chars . length ;

      // This innermost loop compares characters of 'name' against the 'board'.
      for ( j = 0 ; j < len ; j ++ ) {

        // Calculates the index on the 'board' based on 'j' and the current 'diff'.
        idx = j + diff * j ;

        // Checks if the character at 'idx' on the 'board' matches the 'j'-th character of 'name',
        // AND if this is the very last character of 'name' being checked.
        if ( board [ idx ] == chars [ j ] && j == len - 1 ) {
          // If both conditions are true, a full match for the 'name' pattern is found.
          able = true ; // Set the flag to true.
          break ;      // Exit the current innermost 'j' loop.
        }
      }

      // After the 'j' loop, if a match was found ('able' is true),
      // then there's no need to check further 'diff' values for this board.
      if ( able ) {
        break ; // Exit the 'diff' loop.
      }
    }

    // If 'able' is true after all 'diff' iterations for the current board,
    // it means the 'name' pattern was successfully found on this board.
    if ( able ) {
      cnt ++ ; // Increment the total count of matches.
    }
  }

  // After processing all 'n' boards, print the final count of matches to the console.
  console . log ( cnt ) ;

} ) ; // End of the 'data' event handler function.