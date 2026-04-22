/*
 * This JavaScript module defines the Main function to process input data.
 * It reads from standard input, performs specific calculations, and outputs a result.
 */
function   Main   (   input   )
{
    // The entire input string is provided to this function.
    // We split it by newline to get individual lines.
    // input[0] will be the first line, input[1] the second, and so on.
    input   =   input .   split (   "\n"   )   ;


    var   tmp     =   input [   0   ] .   split (   ' '   )   ;

    // Extract numerical values from the first line.
    var   nums    =   Number (   tmp [   0   ]   )   ;
    var   max     =   Number (   tmp [   1   ]   )   ;


    // Get the array of numbers from the second line of input.
    var   number  =   input [   1   ] .   split (   ' '   )   ;

    // Initialize an empty list to store the results of a transformation.
    var   newList =   [   ]   ;


    // Iterate through the 'number' array for 'nums' times.
    // Convert each element to a number, multiply by 0.5, and push to 'newList'.
    for   (   var   i   =   0   ;   i   <   nums   ;   i   ++   )
    {
        newList .   push (   Number (   number [   i   ]   )   *   0.5   )   ;
    }


    // Calculate the product of all elements in 'newList' using the reduce method.
    var   hanKobai   =   newList .   reduce (   (   a   ,   b   )   =>   a   *   b   )   ;

    var   count      =   0   ; // Initialize a counter.


    // Loop as long as 'max' is greater than 'hanKobai'.
    // In each iteration, 'hanKobai' is doubled, and 'count' is incremented.
    while   (   max   >   hanKobai   )
    {
        hanKobai   +=   hanKobai   ; // Double 'hanKobai'.
        count   ++   ;             // Increment the counter.
    }


    // Output the final calculated count to the console.
    console .   log (   count   )   ;
}


// *****************************************************************************
// DO NOT MODIFY THE CODE BELOW THIS LINE.
// This section handles reading from standard input and invoking the Main function.
// It ensures that the Main function receives the entire input data.
// *****************************************************************************
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;