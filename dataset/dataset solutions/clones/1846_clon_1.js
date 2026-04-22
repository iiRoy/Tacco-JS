/*
 * This is a JavaScript program demonstrating conditional logic
 * based on the last digit of an input argument.
 *
 * It uses a functional approach with an arrow function for 'main'.
 */

const   main   =   arg   =>
{
    // Step 1: Convert the input argument into a string.
    // This ensures we can easily access its characters.
    const   str     =   String(  arg  ) ;

    /*
     * Step 2: Extract the last character of the string.
     * Then, convert this character into a numeric digit.
     * This digit will be used for the subsequent conditional checks.
     */
    let     dig     =   Number(  str[  str.length    -    1  ]  ) ;


    // Step 3: Evaluate the extracted digit against predefined conditions.
    // The logic branches based on the digit's value.
    if  (  [  2,  4,  5,  7,  9  ]  .includes  (  dig  )  )
    {
        // If the digit falls into this specific set, print 'hon'.
        console  .log  (  'hon'  ) ;
    }
    else  if  (  [  0,  1,  6,  8  ]  .includes  (  dig  )  )
    {
        // If the digit is found within this alternative set, print 'pon'.
        console  .log  (  'pon'  ) ;
    }
    else  if  (  dig   ==   3  )
    {
        // For the special case where the digit is exactly 3, print 'bon'.
        console  .log  (  'bon'  ) ;
    }
    // No other explicit 'else' block is defined, implying other digits are silently ignored.
}


// Program entry point:
// Reads content from standard input (typically '/dev/stdin' on Unix-like systems),
// decodes it as UTF-8, and then passes this content as an argument to the 'main' function.
main  (  require  (  'fs'  )  .readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ) ;