// This is a Type I clone of an existing JavaScript program.
// It reads numbers from standard input, sums them up, and prints the total.

    var input =   require('fs') .   readFileSync('/dev/stdin' ,  'utf8') . trim (  );
    // The input string is read from /dev/stdin and then any leading/trailing whitespace is removed.
    var lines    =  input . split ( '\n' ) ;


    var sum   =   0  ; // Initialize the total sum.
    var line    ;  // Declare a variable to hold each line read.

    while (  line  =  lines . shift (  )   )
    {
        // For each line, split it by non-digit characters to extract numbers.
        var arr    =   line . split (   /\D+/   ) ;

        // Use reduce to sum all numbers found in the current line.
        // The unary plus operator (+n) converts the string to a number.
        sum  +=   arr . reduce (  function (  p  ,  n  )  {
            return   p   +   +n ;
        } ,  0  ) ;
    }

    // Finally, print the accumulated sum to the console.
    console . log (   sum   ) ;