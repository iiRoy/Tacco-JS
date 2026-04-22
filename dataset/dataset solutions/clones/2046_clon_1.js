// This is a Type I clone.
// All functional aspects are preserved.
// Only whitespace and comments are altered.

  function   Main  (  input  )
  {
        // Declare a temporary variable, though it's not used later in this specific implementation.
    var   tmp   =   input . split ( " " ) ;

        // Parse the input string into a number.
        // The radix (base) is explicitly set to 10 for clarity, although it's the default for Number().
    var   L   =   Number ( input ,   10 ) ;


    // Problem Definition:
    // Input Parameter:
    //   L: A single positive integer. This represents the sum of the three dimensions (x+y+z) of a cuboid.

    // Desired Output:
    //   The maximum possible volume (S = x*y*z) of a cuboid
    //   given the constraint that x+y+z = L.
    //   The maximum volume for a fixed sum occurs when x = y = z.
    //   Therefore, x = y = z = L/3. The volume is then (L/3)^3.

        console . log ( Math . pow ( L   /   3 ,   3 ) ) ;

  } // End of Main function definition.


// --- Standard Input/Output Handling ---
// !!! IMPORTANT: Do NOT modify the lines below this comment.
// This section is specifically designed for handling standard input
// and subsequently invoking the primary application logic (the 'Main' function)
// with the read data.

Main (
    require ( "fs" )
        . readFileSync (
            "/dev/stdin" ,
            "utf8"
        )
) ; // Call the Main function, passing the content of standard input.