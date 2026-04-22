// This JavaScript program processes a series of input cases.
// It reads data, performs calculations, and outputs results.
// The structure is typical for competitive programming problems.

function  Main  (  input  )
{
    // The initial input is a single string containing multiple lines.
    // We split it into an array of strings, where each element is a line.
    input  =  input.split ( "\n" ) ;

    // 'k' serves as an index to navigate through the 'input' array.
    // It keeps track of the current line being processed.
    k  =  0 ;

    // This is the main processing loop. It runs indefinitely until an explicit 'break' statement is encountered.
    while  (  1  )
    {
        // The line at index 'k' is further split by spaces to extract individual values.
        input [ k ]  =  input [ k ].split ( ' ' ) ;

        // Parse the first three numerical values from the current line.
        // These represent 'n', 'm', and 'p' for the current test case.
        var  n  =  parseInt (  input [ k ] [ 0 ] ,  10  ) ;
        var  m  =  parseInt (  input [ k ] [ 1 ] ,  10  ) ;
        var  p  =  parseInt (  input [ k++ ] [ 2 ] ,  10  ) ;  // 'k' is incremented immediately after 'p' is parsed.

        // Check for the termination condition: if all three values (n, m, p) are zero.
        if  (  n  ==  0  &&  m  ==  0  &&  p  ==  0  )
        {
            // If the condition is met, exit the 'while' loop.
            break ;
        }


        // Initialize 'sum' to accumulate values for the current test case.
        var  sum  =  0 ;
        // Declare 'win' which will hold a specific value determined during the loop.
        var  win ;


        // This loop iterates 'n' times to process subsequent data lines specific to the current test case.
        for  (  var  i  =  0 ;  i  <  n ;  i++  )
        {
            // Parse the next line (at the incremented 'k' index) as an integer 'a'.
            // 'k' is incremented again after reading each 'a'.
            var  a  =  parseInt (  input [ k++ ] ,  10  ) ;

            // Add the current value 'a' (multiplied by 100) to the running 'sum'.
            sum  +=  a  *  100 ;

            // Check if the current loop index 'i' matches 'm - 1'.
            // This condition is used to identify a specific 'a' value to be stored in 'win'.
            if  (  m  -  1  ==  i  )
            {
                win  =  a ;
            }
        }


        // After processing all 'n' values, apply a percentage reduction to the total 'sum'.
        // The reduction is based on the value of 'p'.
        sum  =  sum  *  (  100  -  p  )  /  100 ;


        // Finally, determine the output based on the 'win' value.
        if  (  win  >  0  )
        {
            // If 'win' is positive, calculate the floor of (sum / win) and print it.
            console.log (  Math.floor (  sum  /  win  )  ) ;
        }
        else
        {
            // If 'win' is zero or negative, simply print "0".
            console.log (  "0"  ) ;
        }

        // End of processing for one complete test case.
    } // End of the main 'while' loop.

} // End of the 'Main' function definition.


// This line is responsible for reading the input from standard input (e.g., a file or console).
// It then calls the 'Main' function with the read content.
Main (  require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" )  ) ;