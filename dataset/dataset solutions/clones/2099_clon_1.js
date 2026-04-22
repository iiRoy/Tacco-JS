/* This function, 'Main', is designed to process the entire input string provided to it. */

function    Main   (   input   )    {

        // Declare a temporary variable to hold the split input.
        var   tmp   =   input.split  (   " "   )   ;

        // Parse the numerical components from the split input.
        var    s    =    parseInt   (  tmp[0]  ,   10  )   ;
        var    a    =    parseInt   (  tmp[1]  ,   10  )   ;
        var    b    =    parseInt   (  tmp[2]  ,   10  )   ;

    // Calculate the sum of 'a' and 'b', storing it in 'aa'.
    // Note the redundant semicolon, which is preserved as per Type I clone rules.
    aa   =   a   +   b   ;   ;

    // Calculate the remainder of 's' divided by 'aa'.
    var   amari   =   s   %   aa   ;

    // Calculate the integer quotient of 's' divided by 'aa'.
    var   sho   =   Math.floor   (   s   /   aa   )   ;

    // Initialize the final result variable 'AAA'.
    var   AAA   =   sho   *   a   ;

    // Apply conditional logic based on the remainder 'amari'.
    if   (  amari   >   a   )   {
        // If 'amari' is greater than 'a', add 'a' to 'AAA'.
        AAA   +=   a   ;
    }   else   {
        // Otherwise, add the remainder 'amari' to 'AAA'.
        AAA   +=   amari   ;
    }

    // Output the final calculated value of 'AAA' to the console.
    console.log   (   AAA   )   ;

}


/*
 *  IMPORTANT: Do not modify the code below this line.
 *  It handles standard input/output operations, reading data
 *  from /dev/stdin and invoking the 'Main' function with it.
 */
Main   (   require("fs").readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;