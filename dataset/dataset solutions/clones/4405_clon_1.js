// This directive enforces strict mode, helping to write cleaner code.
"use strict" ;

/*
 * Main function definition.
 * It takes a single argument, which is expected to be a string.
 */
const   main   =   arg   =>   {
    // Process the input argument: trim whitespace and split by newlines.
    arg    =    arg.trim().split("\n")  ;

    // Parse the first line of input as an integer for N.
    const   N   =   parseInt(arg[0]) ;

    /*
     * Process the second line: split by space,
     * convert each part to an integer, and then sort the array in ascending order.
     */
    const   A   =   arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b)  ;

    // Initialize an empty array to store numbers that appear as pairs.
    let   pairNums   =   [ ] ;

    // Loop through the sorted array A to find adjacent duplicate numbers.
    for   (   let   i   in   A   )   {
        // Check if the current element is equal to the next element.
        if   (   A[i]   ===   A[parseInt(i)   +   1]   )   {
            // If they are equal, it means we found a pair, add the number to pairNums.
            pairNums.push(   A[i]   )   ;
        }
    }

    // Sort the found pair numbers in descending order.
    pairNums.sort(   (a,b)   =>   b-a   )   ;

    // Create a Set from pairNums to get unique paired numbers.
    const   set   =   new   Set(pairNums)   ;

    // If there's only one unique paired number, it means we only have one type of pair.
    if   (   [...set].length   ===   1   )   {
        // In this case, the answer is the square of that unique number.
        console.log(   [...set][0]   *   [...set][0]   )   ;
        // Exit the function.
        return   ;
    }

    // Otherwise, if there are multiple unique paired numbers,
    // multiply the two largest unique paired numbers.
    // If no pairs were found (pairNums.length is 0), output 0.
    console.log(   pairNums.length   ?   [...set][0]   *   [...set][1]   :   0   )   ;
}

// Call the main function with input read from stdin.
main   (   require("fs").readFileSync("/dev/stdin",   "utf8")   )   ;