/* This is an extensively modified Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered to maintain exact logical equivalence.
 * No identifiers, variable names, function names, operators, or expressions have been changed.
 */

function   Main  (   input   )   { // Main function definition starts here

    // Process the input string: trim leading/trailing whitespace, split by newline,
    // then for each resulting line, split it by spaces.
    // The final structure is a 2D array where each inner array represents a line of space-separated values.
    input  =  input  .  trim  (  )  .  split  (  "\n"  )  .  map  (  function  (  x  )   {
        // This anonymous function takes a line (x) and splits it into an array of strings.
        return   x  .  split  (  " "  )
    }  )  ;


    // Extract the value of N from the first element of the first processed line.
    // Parse it as a base-10 integer.
    var   N  =  parseInt  (  input  [  0  ]  [  0  ]  ,  10  )  ;


    // Initialize an array, 'RGBWithoutOrder', with specific starting values.
    // These values likely represent counts or states for a problem involving 3 categories (e.g., R, G, B or 0, 1, 2).
    var   RGBWithoutOrder  =  [  1  ,  0  ,  0  ]  ;


    // Declare two temporary variables, 'tmp1' and 'tmp2', to be used within the loop.
    var   tmp1  ,   tmp2  ;


    // Initialize the 'ans' (answer) variable. It starts at 3, which could be an initial number of choices or a base value.
    var   ans  =  3  ;


    // Begin a loop that iterates from i = 1 up to (but not including) N.
    // This loop processes N-1 subsequent data points after an initial setup or N value.
    for   (  var   i  =  1  ;   i  <  N  ;   i  ++  )   {

        // Reset 'tmp2' to 0 at the beginning of each iteration of the outer loop.
        tmp2  =  0  ;

        // Parse the current element from the second line of input (index 1) at position 'i' as an integer.
        // Store this parsed value in 'tmp1'.
        tmp1  =  parseInt  (  input  [  1  ]  [  i  ]  ,  10  )  ;


        // Iterate through each element 'x' in the 'RGBWithoutOrder' array.
        // This inner loop counts how many times 'tmp1' appears in 'RGBWithoutOrder'.
        for   (  var   x   of   RGBWithoutOrder  )   {
            // If the current element 'x' is strictly equal to 'tmp1', increment 'tmp2'.
            if   (  x  ===  tmp1  )   tmp2  ++  ;
        }


        // Multiply the current 'ans' by 'tmp2'. This accumulates the product of counts.
        ans  *=  tmp2  ;

        // Apply the modulo operation to 'ans'. This is typically used in problems to prevent integer overflow
        // and keep the result within a specific range, often for large numbers.
        // (1e+9 + 7 is a common prime modulus in competitive programming).
        ans  %=  (  1e+9  +  7  )  ;


        // This loop iterates 3 times (for indices 0, 1, 2) to update the 'RGBWithoutOrder' array.
        for   (  var   j  =  0  ;   j  <  3  ;   j  ++  )   {
            // If an element in 'RGBWithoutOrder' at index 'j' matches 'tmp1'...
            if   (  RGBWithoutOrder  [  j  ]  ===  tmp1  )   {
                // ...increment that element.
                RGBWithoutOrder  [  j  ]  ++  ;
                // ...and immediately break out of this inner loop.
                // This implies that only the first matching element is updated per outer loop iteration.
                break  ;
            }
        }

    } // End of the main 'for' loop.


    // After the loop, perform a final check.
    // If the first element of the second line of input (input[1][0]) is not 0, then set 'ans' to 0.
    // This condition might represent an invalid starting state or a specific problem constraint.
    if   (  parseInt  (  input  [  1  ]  [  0  ]  ,  10  )  !==  0  )   ans  =  0  ;

    // Print the final calculated answer to the console.
    console  .  log  (  ans  )  ;

} // End of Main function definition.


// This line reads input from standard input (typically '/dev/stdin' in Unix-like systems for competitive programming),
// decodes it as UTF-8, and passes it to the Main function to start the program execution.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;