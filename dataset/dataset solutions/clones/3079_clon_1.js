/*
 * This is the main function that processes the input.
 * It determines if three input values are equal.
 */
function   MainA  (   input   )
{
    // The input string is first split by newline, then the first line is taken,
    // and finally split by spaces to get individual values.
    input  =  input . split ( "\n" ) [ 0 ] . split ( " " ) ;

    var  a  =  input [ 0 ] ; // First value from the input
    
    var  b  =  input [ 1 ] ; // Second value from the input

    var  c  =  input [ 2 ] ; // Third value from the input

    /*
     *  Calculate the result:
     *  If 'a' is equal to 'b' AND 'b' is equal to 'c', then the result is "Yes".
     *  Otherwise, the result is "No".
     */
    var  result  =  ( a  ==  b  &&  b  ==  c )  ?  "Yes"  :  "No" ;


    // Output the calculated result to the console.
    console . log ( '%s' , result ) ;
}


// --- DO NOT MODIFY THE FOLLOWING LINES ---
// These lines handle reading input from stdin and calling the main function.
MainA (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )   ) ;