/*
 * This is a JavaScript function designed to calculate a specific value.
 * It takes a single string 'input' as its argument.
 */
function   Main   (   input   )   {

    // Parse the input string into an integer to get the 'price'.
    var    price    =   parseInt(   input   )   ;

    // Initialize a variable 't' with a starting value of 1000.
    var    t    =    1000    ;

    // This loop increments 't' by 1000 until it is greater than the 'price'.
    // It essentially finds the smallest multiple of 1000 that is greater than 'price'.
    while   (   t   <=   price   )   {

        t   +=   1000   ;   // Increment 't' by 1000 in each iteration.
    }

    // Output the difference between the final 't' value and the original 'price'.
    // This represents how much 't' exceeds 'price'.
    console.log   (   t   -   price   )   ;

}   // End of the Main function definition.


/*
 * This part of the script reads input from standard input,
 * converts it to a UTF-8 string, and then passes it to the Main function.
 * It's a common pattern for competitive programming environments in Node.js.
 */
Main   (   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;