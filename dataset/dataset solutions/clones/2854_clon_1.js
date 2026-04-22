/*
 * This is a Type I clone of an existing JavaScript function.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as they were in the original source code.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered to create a visually distinct but functionally identical version.
 */

function   Main   (   input   )
{
    // The input string is processed by splitting it into an array of strings
    // based on space characters. This prepares the values for parsing.
    input  =  input . split (  " "  ) ;


    /*
     * Three integer variables (P, Q, R) are declared and initialized.
     * Their values are parsed from the first three elements of the
     * 'input' array, using base 10 for integer conversion.
     */
    var   P   =   parseInt (  input [ 0 ] ,  10  ) ;
        var   Q   =   parseInt (  input [ 1 ] ,  10  ) ;
            var   R   =   parseInt (  input [ 2 ] ,  10  ) ;


    // Three temporary sums (T1, T2, T3) are computed.
    // T1 holds the sum of P and Q.
    var   T1   =   P   +   Q ;
    // T2 holds the sum of Q and R.
    var   T2   =   Q   +   R ;
    // T3 holds the sum of R and P.
    var   T3   =   R   +   P ;


    // A series of conditional statements to determine and print the smallest of the three sums (T1, T2, T3)
    // based on the specific comparison logic provided in the original code.
    if   (   T1   >=   T2   )
    {
        // If T1 is greater than or equal to T2, we then compare T2 with T3.
        if   (   T2   >=   T3   )
        {
            // If T2 is also greater than or equal to T3, then T3 is the minimum among the tested values.
            console . log (  T3  ) ;
        }
                                else
                                {
                                    // Otherwise (if T2 < T3), T2 is the minimum in this branch.
                                    console . log (  T2  ) ;
                                }
    }
    else   if   (   T1   >=   T3   )
         {
             // This branch is reached if T1 < T2.
             // If T1 is greater than or equal to T3 here, then T3 is the minimum.
             console . log (  T3  ) ;
         }
                                    else
                                    {
                                        // If none of the above conditions are met (T1 < T2 AND T1 < T3),
                                        // then T1 is the smallest value.
                                        console . log (  T1  ) ;
                                    }


}


/*
 * This critical section handles the standard input/output operations.
 * It is designed to read input from '/dev/stdin' and pass it to the Main function.
 * As per the original instructions, this part should typically remain untouched
 * in its logical structure, but whitespace and comments can be altered.
 */
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;