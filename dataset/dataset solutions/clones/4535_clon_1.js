/*
 * This is a JavaScript function designed to process
 * a string containing parentheses.
 * It attempts to balance them by removing matched pairs,
 * then adds missing parentheses to the beginning and end
 * to make the remaining string balanced.
 */
function     main  (  data  )
{
  // The main entry point of the program.
  // 'data' is expected to be a string containing lines of input.

  // Split the input data by newline characters.
  input   =  data . split ( "\n" ) ;


  // The first line of input represents the length (unused in logic, but present).
  len  =  input [ 0 ]
  ; // Semicolon added for consistency, though optional after expression

  // The second line of input is the main string to be processed.
  str    =   input [ 1 ]   ;


  // Create a temporary array of characters from the string.
  temp    =    input [ 1 ] . split ( "" )     ;


  // Initialize two empty strings for accumulating missing parentheses.
  n   =   ""   ;
  m   =   ""   ;


  // This is the first main loop.
  // It iterates backwards through the 'temp' array to find and remove
  // matching '()' pairs.
  for    (    i    =    len    ;
              i    >=    0    ;
              i    -=    1    )
  {
    // Check if the current character is a closing parenthesis.
    if    (    temp [ i ]    ===    ")"    )
    {
      // If it is, search backwards from 'i-1' for an opening parenthesis.
      for    (    j    =    i    -    1    ;
                  j    >=    0    ;
                  j    -=    1    )
      {
        // Found an opening parenthesis.
        if    (    temp [ j ]    ===    "("    )
        {
          // Remove the closing parenthesis at index 'i'.
          temp . splice ( i , 1 ) ;
          // Remove the opening parenthesis at index 'j'.
          // Note: 'j' might be smaller than 'i', so 'i' is removed first.
          // This order is crucial.
          temp . splice ( j , 1 ) ;

          // Break out of the inner loop as a pair has been found and removed.
          break    ;
        } // End of inner 'if'
      } // End of inner 'for' loop
    } // End of outer 'if'
  } // End of first main 'for' loop


  // This is the second main loop.
  // It iterates through the remaining characters in 'temp'
  // to count unmatched parentheses.
  for    (    i    =    0    ,    len    =    temp . length    ;
              i    <    len    ;
              i    +=    1    )
  {
    // If the remaining character is a closing parenthesis,
    // it means an opening one is missing before the original string.
    if    (    temp [ i ]    ===    ")"    )
    {
      // Add an opening parenthesis to 'n'.
      n    +=    "(" ;
    } // If not a closing parenthesis, it must be an opening one (or other chars if any).
    else
    {
      // If the remaining character is an opening parenthesis,
      // it means a closing one is missing after the original string.
      m    +=    ")"    ;
    } // End of 'else'
  } // End of second main 'for' loop


  // Finally, print the balanced string.
  // 'n' contains leading '(' for unmatched ')'s.
  // 'str' is the original string.
  // 'm' contains trailing ')' for unmatched '('s.
  console . log ( n    +    str    +    m ) ;

} // End of 'main' function


// Invoke the main function with input read from standard input.
/*
 * This part reads the entire content of /dev/stdin
 * as a UTF-8 string and passes it to the main function.
 * It's a common pattern for competitive programming in Node.js.
 */
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" ) ) ;
// End of file.