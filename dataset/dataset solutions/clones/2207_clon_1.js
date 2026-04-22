'use strict' // This directive enforces strict mode for the entire script, promoting cleaner and safer code practices.


// This constant arrow function, 'effect', calculates a specific value based on inputs H, a, and b.
const effect  =  (  H ,  a ,  b  )  =>  {

    // A conditional check: if 'a' is found to be greater than 'H',
    // 'a' is reassigned the value of 'H', effectively capping its maximum value.
    if  (  a  >  H  )
        a  =  H // Note: no curly braces here, valid for single-statement if blocks.

    // The function then computes and returns the result of H divided by a,
    // and that result is subsequently multiplied by b.
    return   H  /  a  *  b
} // The closing brace for the 'effect' function.


// The main function, serving as the primary entry point for the program's logic.
// It accepts a single argument, 'inp', which is expected to be a string.
function   main   (   inp   )   {


    // The input string is first trimmed of any leading or trailing whitespace.
    // Subsequently, it is split into an array of strings, with each element representing a line.
    inp   =   inp
              .  trim  (  )
              .  split  (  '\n'  )


    // The first line of the processed input array is removed (shifted).
    // This line is then split by spaces, and each resulting substring is converted into a number.
    const   HN   =   inp
                     .  shift  (  )
                     .  split  (  ' '  )
                     .  map  (  n  =>  Number  (  n  )  )


    // A mutable variable 'H' is initialized with the first numerical value from the 'HN' array.
    let   H   =   HN  [  0  ]


    // The remaining lines in the 'inp' array are iterated over.
    // Each line is individually split by spaces, and its components are converted to numbers.
    // This transforms 'inp' into a 2D array of numbers.
    inp   =   inp
              .  map  (  r  =>  r  .  split  (  ' '  )  .  map  (  n  =>  Number  (  n  )  )  )


    // An accumulator variable, 'ans' (for 'answer'), is initialized to zero.
    let   ans   =   0


    // A 'while' loop is initiated, which will continue to execute as long as 'H' remains a positive value.
    while   (   H   >   0   )   {

        // Inside the loop, the 'inp' array is sorted.
        // The sorting logic uses the 'effect' function to compare pairs of elements (a, b).
        // The spread operator (...) ensures that elements of 'a' and 'b' arrays are passed as individual arguments.
        const   next   =   inp
                           .  sort  (  (  a  ,  b  )  =>  effect  (  H  ,  ... a  )  -  effect  (  H  ,  ... b  )  )


        // 'H' is decremented by the first value of the first element in the newly sorted 'next' array.
        H   -=   next  [  0  ]  [  0  ]


        // The second value of the first element in the 'next' array is added to 'ans'.
        ans   +=   next  [  0  ]  [  1  ]

    } // The loop concludes when 'H' is no longer greater than zero.


    // Finally, the accumulated 'ans' is printed to the console.
    // It's presented within an object literal for clear labeling in the output.
    console  .  log  (  {  ans  }  )

} // The 'main' function definition ends here.


// This line invokes the 'main' function.
// It reads content synchronously from the standard input file ('/dev/stdin')
// using the 'fs' (file system) module and specifies 'utf8' encoding.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )
;