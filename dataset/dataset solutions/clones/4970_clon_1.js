console
  .log
    (
      (
        /*
         *  This is an immediately invoked anonymous arrow function.
         *  It processes input arguments to determine a final character.
         */
        args =>
        {
          // Declare and initialize three constant arrays: 'a', 'b', 'c'.
          // These are populated by processing the input string 'args'.
          const   [ a , b , c ]   =   args
                                      .  trim  (  )          // First, remove any leading or trailing whitespace.
                                      .  split  `\n`          // Then, split the cleaned string by newline characters.
                                      .  map    ( r  =>  r . split `` . reverse  ( ) )
                                      ;                       // For each resulting line, split it into characters and reverse the array.

          // Create an object 'S' using object property value shorthand.
          // This effectively stores the three reversed character arrays 'a', 'b', 'c'.
          const   S   =   { a , b , c } ;

          // Initialize a mutable variable 'p' (pointer) with the character 'a'.
          let   p   =   'a' ;

          /*
           *  Core logic loop:
           *  This loop continues as long as the array referenced by the current value of 'p'
           *  (i.e., S['a'], S['b'], or S['c']) has elements remaining.
           *  In each iteration, it removes the last element from that array
           *  and updates 'p' with the value of the popped element.
           */
          while   (   S [ p ] . length   )
          {
            p   =   S [ p ] . pop ( ) ; // Pop the last element from the array S[p] and assign it to p.
          }

          // After the loop terminates, return the final character 'p'
          // converted to its uppercase representation.
          return   p . toUpperCase ( ) ;
        }
      )
      // The argument for the IIFE is the content read from standard input.
      (
        require ( 'fs' )          // Access the Node.js 'fs' (file system) module.
          . readFileSync          // Use the 'readFileSync' method for synchronous file reading.
            (
              '/dev/stdin' ,       // Specify the file path as standard input.
              'utf8'               // Define the character encoding for the input stream.
            )
      )
    )
; // End of the console.log statement.