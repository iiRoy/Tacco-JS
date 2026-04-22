"use strict" // This directive enables strict mode for better error handling.


// The main function processes the input argument.
const   main   =   arg   =>   {

    // Pre-process the input: remove leading/trailing whitespace and split by newline.
    arg   =   arg.trim().split("\n");


    // Parse the first line as an integer N. (Although N is not used later, it's parsed).
    const   N   =   parseInt(arg[0]);


    // Parse the second line: split by space, convert to integers, and sort in ascending order.
    const   A   =   arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>a-b);


    // Initialize an array to store numbers that appear as pairs.
    let   pairNums   =   [];


    // Iterate through the sorted array A to find adjacent equal numbers.
    // Note: 'for...in' iterates over string keys, so parseInt(i) is used for array access.
    for   (   let   i   in   A   )   {

        // Check if the current element is equal to the next element.
        if   (   A[i]   ===   A[parseInt(i)   +   1]   )   {

            // If they are equal, add the number to the pairNums array.
            pairNums.push(A[i]);
        }
    }


    // Sort the found pairs in descending order to easily get the largest ones.
    pairNums.sort((a,b)=>b-a);


    // Create a Set from pairNums to get unique pairs.
    // This is important because the problem asks for the two largest *distinct* numbers that form pairs.
    const   set   =   new   Set(pairNums);


    // Determine the result based on the number of unique pairs found.
    // If there are at least two unique pair numbers, multiply the two largest.
    // Otherwise, the result is 0.
    console.log(pairNums.length   ?   [...set][0]   *   [...set][1]   :   0);
}


// Read input from /dev/stdin synchronously and pass it to the main function.
main(require("fs").readFileSync("/dev/stdin",   "utf8"));