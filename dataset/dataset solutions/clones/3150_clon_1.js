/*
 * This script processes numerical input from stdin.
 * It defines a 'main' function that takes a string input,
 * parses it, performs a conditional calculation, and prints a result.
 */
const    main    =    (   input   )    =>    {

    // Declare and initialize the 'In' array.
    // It splits the input string by spaces and converts each part to a number.
    const   In    =    input .  split  (  ' '  )  .  map  (  n  =>  Number  (  n  )  )  ;


    /*
     * Calculate the 'o1' variable based on a ternary condition.
     * If the first element of 'In' (In[0]) is greater than the second (In[1]),
     * 'o1' is assigned the value 0.
     * Otherwise, 'o1' is assigned the result of In[1] divided by In[0].
     */
    const    o1    =    In  [  0  ]    >    In  [  1  ]    ?    0    :    In  [  1  ]    /    In  [  0  ]    ;


    // Output the final result to the console.
    // Another ternary operation determines what to print:
    // If 'o1' is greater than or equal to the third element (In[2]),
    // In[2] is printed.
    // Otherwise, the integer part of 'o1' is printed.
    console  .  log  (  o1    >=    In  [  2  ]    ?    In  [  2  ]    :    parseInt  (  o1  )  )  ;

}   //    End    of    the    'main'    function    definition.


// This line calls the 'main' function immediately.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's built-in 'fs' module.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,    'utf8'  )  )  ;