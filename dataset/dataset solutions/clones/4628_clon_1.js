"use strict" ; // Enforces strict parsing and error handling in JavaScript.


const   main   =   arg   =>   {
    // Process the input argument: trim whitespace and split into lines.
    arg   =   arg.trim().split("\n")   ;


    const   N   =   parseInt(arg[0])   ; // The first line contains the integer N.

    // The second line contains space-separated numbers, parse them into an array A.
    const   A   =   arg[1].split(" ").map(   n   =>   parseInt(n)   )   ;


    let   totalSum   =   A[0]   ; // Initialize the running total with the first element of A.
    let   answer   =   0   ;       // Initialize a counter for the number of operations.


    // Loop through the array A starting from the second element (index 1).
    for   (   let   i   =   1   ;   i   <   N   ;   i++   )   {

        // Adjust A[i] if the cumulative sum is non-negative and would remain so after adding A[i].
        // This loop decrements A[i] and increments 'answer' until the condition is no longer met.
        while   (   (totalSum   >=   0)   &&   (totalSum   +   A[i]   >=   0)   )   {
            A[i]--   ;   // Decrement the current element.
            answer++   ; // Increment the operation count.
        }


        // Adjust A[i] if the cumulative sum is non-positive and would remain so after adding A[i].
        // This loop increments A[i] and increments 'answer' until the condition is no longer met.
        while   (   (totalSum   <=   0)   &&   (totalSum   +   A[i]   <=   0)   )   {
            A[i]++   ;   // Increment the current element.
            answer++   ; // Increment the operation count.
        }


        totalSum   +=   A[i]   ; // Update the total sum with the (potentially modified) A[i].
    }


    // Print the final count of operations to the console.
    console.log(   answer   )   ;

}   ;


// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main(   require('fs').readFileSync('/dev/stdin',   'utf8')   )   ;