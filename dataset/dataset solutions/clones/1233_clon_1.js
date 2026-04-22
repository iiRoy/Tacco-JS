/*
 * This JavaScript program reads input from stdin, processes it,
 * and then prints sorted numbers to stdout.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27 (simulated)
 */

var input =    require (   'fs'   ) .   readFileSync  (  '/dev/stdin'  ,   'utf8'   ) ;


// This line reads all the input from standard input.

var x   =   input .   split  (  '\n'  ) ; // Split the input string into an array of lines.

// Begin iterating through each line of the input array.
for  (  i  =  0  ;  i  <  x . length  ;  i ++   )
{
    // Process the current line: split by space and convert elements to numbers.
    var row   =   x  [  i  ] .   split  (  ' '  ) .   map  (  Number  ) ;

    // Assign the first element of the row to variable 'a'.
    a   =   row  [  0  ] ;

    // Assign the second element of the row to variable 'b'.
    b   =   row  [  1  ] ;


    // Check if the termination condition (both 'a' and 'b' are zero) is met.
    if  (  a   ===   0   &&   b   ===   0   )
    {
        break  ; // Exit the loop if the condition is true.
    }


    // Sort the 'row' array numerically in ascending order.
    var m   =   row .   sort  (  function  (  a  ,   b  )
    {
        return   a   -   b  ; // The comparison function for numeric sort.
    }   ) ;

    // Print the sorted numbers, joined by a single space, to the console.
    console .   log  (  m .   join  (  ' '  )  ) ;
}

// End of the program logic.