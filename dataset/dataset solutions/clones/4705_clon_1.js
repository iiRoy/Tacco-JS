/*
 * This JavaScript file contains a function named 'Main'
 * which processes input to solve a specific problem.
 * It appears to be related to some kind of string manipulation
 * or pattern matching, possibly a sheep and wolf problem.
 * The goal is to find a valid sequence or output -1 if none exists.
 */


function Main ( input )
{
  // Split the input string by newline characters.
  input = input . split ( "\n" ) ;

  // The second line of input is considered the main string 'S'.
  var S = input [ 1 ] ;

  // 'array' will store the generated sequence of 'S' or 'W'.
  var array ;

  // 'flg' (flag) indicates if a solution has been found. Initialized to false.
  var flg = false ;


  // Outer loop: iterates through initial states for array[0] ("S" or "W").
  [ "S" , "W" ] . forEach ( a =>
  {
    // Inner loop: iterates through initial states for array[1] ("S" or "W").
    [ "S" , "W" ] . forEach ( b =>
    {
      // Initialize 'array' with the length of 'S'.
      array = new Array ( S . length ) ;

      // Set the first two elements of 'array' based on current loop variables 'a' and 'b'.
      array [ 0 ] = a ;
      array [ 1 ] = b ;

      /*
       * Loop to deduce the remaining elements of 'array' from index 2 up to S.length.
       * The logic depends on the previous two elements (array[i-1], array[i-2])
       * and the corresponding character in the input string 'S' (S[i-1]).
       */
      for ( var i = 2 ; i < S . length ; i ++ )
      {
        // Check the condition: (array[i-1] is "W" XOR S[i-1] is "o")
        if ( array [ i - 1 ] === "W" ^ S [ i - 1 ] === "o" )
        {
          // If the condition is true, array[i] is the same as array[i-2].
          array [ i ] = array [ i - 2 ] ;
        }
        else
        {
          // If the condition is false, determine array[i] based on array[i-2].
          if ( array [ i - 2 ] === "W" )
          {
            array [ i ] = "S" ; // If array[i-2] is "W", set array[i] to "S".
          }
          else
          {
            array [ i ] = "W" ; // Otherwise (if array[i-2] is "S"), set array[i] to "W".
          }
        }
      }

      /*
       * The following console.log lines were commented out in the original code.
       * They are kept commented out to preserve the original behavior and intent.
       * console.log(array.join(""));
       * console.log(array[0]==="S");
       * console.log(S[0]==="o");
       * console.log(array[array.length-1]===array[1]);
       * console.log(array[0]==="S"^S[0]==="o"^array[array.length-1]===array[1]);
       * console.log(array[array.length-1]==="S"^S[array.length-1]==="o"^array[array.length-2]===array[0]);
       */


      /*
       * Final check for a valid solution based on complex XOR conditions.
       * This checks if 'flg' is false (meaning no solution found yet) AND
       * if two specific XOR conditions involving array elements and 'S' characters are met.
       */
      if ( ! flg &&
           ( array [ 0 ] === "S" ^ S [ 0 ] === "o" ^ array [ array . length - 1 ] === array [ 1 ] ) &&
           ( array [ array . length - 1 ] === "S" ^ S [ array . length - 1 ] === "o" ^ array [ array . length - 2 ] === array [ 0 ] )
         )
      {
         // If a valid solution is found, print the joined array.
         console . log ( array . join ( "" ) ) ;
         // Set the flag to true to indicate a solution has been found.
         flg = true ;
      }
    } ) ; // End of inner forEach loop for variable 'b'
  } ) ; // End of outer forEach loop for variable 'a'


  // After checking all possible initial states, if no solution was found (flg is still false)...
  if ( ! flg )
    console . log ( -1 ) ; // ...print -1 to indicate no solution.
}


/*
 * This section handles standard input/output for the program.
 * It reads the entire content from /dev/stdin, converts it to UTF-8 encoding,
 * and then passes this content as an argument to the Main function for processing.
 *
 * IMPORTANT: As per the original instructions (indicated by the Japanese comment),
 * this part of the code should not be edited or modified.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;