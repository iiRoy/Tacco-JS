// This is a JavaScript program designed to compute the N-th element of a modified Fibonacci sequence.
// The program reads its input from standard input, expecting a single integer on the first line.

function   main  (  s  )   {

    /*
     * Parse the input string 's' to extract the integer 'n'.
     * The input string is expected to contain a number followed by a newline,
     * so we split by newline and take the first element.
     */
    var   n   =   Number (  s.split (  "\n"  )  [  0  ]  ) ;


    // Handle the specific base cases as defined by the problem statement.
    // If n is 0, output 2 and terminate.
    if   (  n   ===   0  )   {
        console.log (  2  ) ;
        return ;
    }

    // If n is 1, output 1 and terminate.
    if   (  n   ===   1  )   {
        console.log (  1  ) ;
        return ;
    }


    /*
     * Initialize variables for the Fibonacci sequence calculation.
     * We use BigInt to handle potentially very large numbers.
     * The sequence starts with F(0) = 2, F(1) = 1.
     * 'x' will hold F(i-2), 'y' will hold F(i-1), and 'z' will hold F(i).
     */
    var   x   =   BigInt (  2  ) ;  // Represents F(0)
    var   y   =   BigInt (  1  ) ;  // Represents F(1)
    var   z   =   BigInt (  0  ) ;  // Placeholder for F(i)


    // Iterate from the second index (i=2) up to 'n' to compute the desired Fibonacci number.
    for   (  var   i   =   2 ;   i   <=   n ;   i++  )   {

        // Calculate the current Fibonacci number (F(i)) by summing the previous two.
        z   =   x   +   y ;

        // Update 'x' and 'y' for the next iteration:
        // The previous F(i-1) becomes the new F(i-2).
        x   =   y ;
        // The current F(i) becomes the new F(i-1).
        y   =   z ;
    }


    // Output the final calculated Fibonacci number 'z' as a string to standard output.
    console.log (  z.toString (  )  ) ;
}


// This is the entry point for the program.
// It reads the entire content of standard input, converts it to a UTF-8 string,
// and then passes it to the 'main' function for processing.
main (  require (  "fs"  ) .readFileSync (  "/dev/stdin" ,   "utf8"  )  ) ;