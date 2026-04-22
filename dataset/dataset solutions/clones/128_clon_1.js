require ( "fs" )
  // Reads the entire content from standard input synchronously.
  . readFileSync ( "/dev/stdin" , "utf8" )
  // Splits the input string into an array of lines.
  . split ( '\n' )
  // Iterates over each line (represented by 'i') in the array.
  // The map function processes each line to extract specific values.
  . map (
    function ( i )
    {
      // Initialize an empty array 'a' to store the results for the current line.
      // Loop from j=9 down to 0 (inclusive of 0).
      // This corresponds to checking bits from 2^9 down to 2^0.
      for (
          a = [] ,
          j = 9 ;
          j -- ;
      )
      {
        // Calculate the current power of 2 (1 shifted left by j positions).
        // Then, perform a bitwise AND operation with the input number 'i'.
        // If the result is non-zero, it means the 'j'-th bit is set in 'i'.
        if (
            ( n = 1 << j )
            &
            i
        )
        {
          // If the bit is set, add the corresponding power of 2 ('n') to the array 'a'.
          a . push ( n ) ;
        }
      }

      // After processing all bits for the current line,
      // check if the array 'a' contains any elements.
      // If a[0] exists, it implies 'a' is not empty.
      if (
          a [ 0 ]
      )
      {
        // Print the elements of array 'a' joined by a single space.
        console . log (
            a . join ( ' ' )
        ) ;
      }
    }
  )
; // End of the entire chain of operations.