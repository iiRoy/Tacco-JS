'use strict'
// This directive enforces strict mode for the entire script.
// It helps catch common coding errors and "unsafe" actions.

function Main(  input  )
{
    // The main function that processes the input data.
    // It takes a single string 'input' as its argument.

    let   temp  =   input.trim().split("\n")  ; // First, trim whitespace and split the input into lines.
    // This creates an array where each element is a line from the input string.

    let   NM    =   temp[0].split(" ").map(  (v)=>(parseInt(v))  )   ;
    // The first line of input (temp[0]) contains two numbers: N and M.
    // Split this line by space, then map each string part to an integer.
    // NM[0] will be N (number of items), and NM[1] will be M (target count).

    let   AB    =   new Array(NM[0])  ; // Initialize an array 'AB' with a size of N.
    // This array will store pairs of [A, B] for each item.

    // Loop through the remaining lines of the input to populate the AB array.
    for   (  let   i = 0  ;  i < NM[0]  ;  i++  )
    {
        // For each line from the second line onwards (temp[i+1]):
        AB[i]   =   temp[i+1].split(" ").map(  (v)=>(parseInt(v))  )  ;
        // Split the line by space and convert the parts to integers.
        // Each element AB[i] will be an array like [price_A, quantity_B].
    }

    // Sort the AB array based on the price (A) in ascending order.
    // This is a crucial step for the greedy approach.
    AB.sort(  (a,b)=>(  a[0]   <   b[0]  ?  -1  :  1  )  )  ;


    let   count   =   NM[1]  ; // Initialize 'count' with the target quantity M.
    let   money   =   0      ; // Initialize 'money' to keep track of the total cost.

    // Iterate through the sorted items (from cheapest to most expensive).
    for   (  let   i = 0  ;  i < NM[0]  ;  i++  )
    {
        // Check if the current item's quantity (AB[i][1]) is less than the remaining 'count'.
        if   (  AB[i][1]   <   count  )
        {
            // If yes, we can buy all of this item.
            // Add the total cost of this item (price * quantity) to 'money'.
            money   +=   AB[i][0]   *   AB[i][1]  ;
            // Decrease the remaining 'count' by the quantity of this item.
            count   -=   AB[i][1]  ;
        }
        else
        {
            // If the current item's quantity is greater than or equal to the remaining 'count',
            // we only need to buy 'count' units of this item.
            money   +=   AB[i][0]   *   count  ;
            // Since we have reached the target 'count', we can stop.
            break  ;
        }
    }
    // Finally, print the total minimum money required to console.
    console.log(  money  )  ;
}

// Read input from stdin, decode it as UTF-8, and pass it to the Main function.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  )  ;
// This line executes the program, reading from standard input.