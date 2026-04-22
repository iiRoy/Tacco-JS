/*
 * This JavaScript code processes a series of directional strings,
 * calculating an angular sum based on a specific algorithm.
 * It reads input from standard input, processes each line until a "#" is encountered,
 * and then prints the simplified fractional or integer result.
 */

   // Import the 'fs' (file system) module to read input.
   var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' )    ;


   // Trim any leading/trailing whitespace from the input and split it into an array of lines.
   var    arr    =    ( input . trim ( ) ) . split ( "\n" )    ;


   // Main processing loop: continues indefinitely until a specific break condition is met.
   while ( true )
   {
      // Retrieve the first string from the array and remove it.
      var    str    =    arr . shift ( )    ;

      // Check for the termination condition: if the string is "#", exit the loop.
      if ( str    ==    "#" )
      {
         break ;
      }

      // Remove all occurrences of "orth" and "est" from the current string.
      // This is a crucial step for the logic that follows.
      str    =    str . replace ( /orth|est/g , "" )    ;

      // Initialize the sum variable, which will hold the calculated angle.
      var    sum    =    0    ;

      // Determine the initial angle based on the first character of the modified string.
      // 'n' (north) typically implies 0 degrees.
      if ( str [ 0 ]    ==    "n" )
      {
         sum    =    0    ;
      }
      // 'w' (west) typically implies 90 degrees.
      if ( str [ 0 ]    ==    "w" )
      {
         sum    =    90    ;
      }

      // 's' stores the previous direction character encountered.
      var    s    =    str [ 0 ]    ;
      // 'j' is a counter used in the angle calculation, related to powers of 2.
      var    j    =    1    ;

      // Iterate through the string starting from the second character.
      for ( var    i    =    1    ;    i    <    str . length    ;    i ++ )
      {
         // If the current character is 'n' and the previous was not 'n', subtract an angle.
         if ( str [ i ]    ==    "n"    &&    s    !=    "n" )
         {
            sum    -=    90    /    Math . pow ( 2 , j )    ;
         }
         // If the current character is 'w' and the previous was not 'w', add an angle.
         if ( str [ i ]    ==    "w"    &&    s    !=    "w" )
         {
            sum    +=    90    /    Math . pow ( 2 , j )    ;
         }

         // Update 'j': if the current character is the same as the previous, increment 'j'; otherwise, reset to 1.
         j    =    ( s    ==    str [ i ] )    ?    j    +    1    :    1    ;
         // Update 's' to the current character for the next iteration.
         s    =    str [ i ]    ;
      }

      // This section aims to convert the sum into its simplest fractional form (or integer).
      var    i    =    1    ;
      while ( true )
      {
         // Check if (sum * i) is an integer.
         if ( ( sum    *    i )    %    1    ==    0 )
         {
            // If i is 1, it means the sum was already an integer or a simple fraction.
            if ( i    ==    1 )
            {
               break    ;
            }
            // If not, format the sum as a fraction string.
            sum    =    ""    +    ( sum    *    i )    +    "/"    +    i    ;
            break    ; // Exit the inner loop after finding the simplest form.
         }
         // Increment 'i' to test the next potential denominator.
         i ++    ;
      }

      // Output the calculated sum (either as an integer or a simplified fraction string).
      console . log ( sum )    ;
   }
// End of the main program logic.