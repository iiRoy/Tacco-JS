/* This file contains the main logic for calculating
 * the minimum product of two distinct remainders modulo 2019.
 * It reads input from standard input and processes it.
 * Created as a Type I clone, focusing on extensive whitespace and comment variations.
 */
const main = (  inputs  ) =>   {
    // Declare the modulo constant as specified in the problem statement.
    // This value is crucial for all remainder calculations.
    var   TW = 2019  ;


    // Extract the lower bound (L) from the first element of the input array.
    // The input is expected to be a string like "L R".
    // split(" ")[0] gets L as a string, and -0 converts it to a number.
    var L = inputs[0].split(  " "  )[0]  -  0  ;

    // Extract the upper bound (R) from the first element of the input array.
    // Similar to L, split(" ")[1] gets R as a string, -0 converts it to a number.
    var R = inputs[0].split(  " "  )[1]  -  0  ;

    // These variables store the initial remainders of L and R with TW.
    // While calculated, they might not be directly used in the final product logic
    // if the loop finds a zero remainder or iterates through the full range.
    var lmod = L  %  TW  ;
    var rmod = R  %  TW  ;


    // Initialize an empty array to store all unique remainders found
    // within the given range [L, R].
    var mods = [  ]  ;


    // Begin a loop that iterates through every integer from L to R (inclusive).
    for (  var i = L  ;  i <= R  ;  i++  )  {
        // Calculate the remainder of the current number 'i' when divided by 2019.
        var val = i  %  2019  ;

        // Add this calculated remainder to our collection.
        // The array will hold all remainders encountered.
        mods.push(  val  )  ;

        // This is an important optimization:
        // If we find any number within the range [L, R] that is a multiple of 2019,
        // its remainder will be 0.
        // In such a case, the minimum possible product of two remainders will definitely be 0
        // (0 multiplied by any other remainder).
        // Therefore, we can stop searching immediately as we've found the optimal scenario.
        if (  val  ==  0  )   break  ;
    }


    // Sort the array of collected remainders in ascending order.
    // This is crucial for easily identifying the two smallest remainders.
    // The comparator function (a, b) => a - b ensures numerical ascending sort.
    mods.sort(  (  a  ,  b  )  =>  a  -  b  )  ;


    // Finally, print the product of the two smallest remainders.
    // If a 0 was found and the loop broke early, mods[0] will be 0, making the product 0.
    // Otherwise, mods[0] and mods[1] will be the two smallest positive remainders from the range.
    console.log(  mods[0]  *  mods[1]  )  ;
}


// --- Main Program Execution Block ---
// This section handles reading input from standard input and invoking the main logic.
main  (
    require(  'fs'  ) // Utilize Node.js's file system module.
        .readFileSync(  '/dev/stdin'  ,  'UTF-8'  ) // Read the entire content of standard input as a buffer, then decode to UTF-8.
        .trim(  ) // Remove any leading or trailing whitespace (like newlines) from the input string.
        .split(  "\n"  ) // Split the cleaned input string into an array of strings, based on newline characters.
)  ;