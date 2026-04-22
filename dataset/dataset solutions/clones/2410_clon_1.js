/*
 * This is a Type I clone of an existing JavaScript program.
 * It processes input to find a specific value based on array sums.
 * The goal is to make visual changes without altering functionality.
 */
function Main(  input  )
{

    // Parse the first line of input to get N, the number of elements.
    var   N   =   parseInt(  input[0],   10  );

    // Parse the second line of input to get the array A, splitting by space.
    var   A   =   input[1] .  split(" ");


    var total = 0; // Initialize total sum of elements.

    /*
     * Loop through the array A to parse elements as integers
     * and calculate their cumulative sum.
     */
    for (  var   i = 0;   i < N;   i++  )
    {
        A[i] = parseInt(A[i] , 10);
        total += A[i];
    }

    /*
     * The following line was a debug statement in the original code,
     * now commented out and reformatted as a block comment.
     * console.log("total:%s", total);
     */


    var   result  =  0; // Initialize result variable.
    var   mae     =  0; // 'mae' (前) means 'before', likely representing a prefix sum.
    var   ato     =  0; // 'ato' (後) means 'after', likely representing a suffix sum.
    var   target  =  0; // Index where the array is conceptually split.

    // Loop to find the split point where the prefix sum is closest to total/2.
    for (  var   i = 0;   i < N;   i++  )
    {
        if (  mae  +  A[i]  <  total  /  2  )
        {
            // If adding the current element keeps 'mae' less than half the total, add it.
            mae += A[i];
        }
        else if (  mae  +  A[i]  ==  total  /  2  )
        {
            // If 'mae' plus the current element is exactly half, the difference is 0.
            console.log( "%s" , 0 );
            return; // Exit early as we found the exact split.
        }
        else
        {
            // We've crossed the halfway point. This 'i' is our target index.
            target = i;
            // Calculate 'ato' (suffix sum) based on the total, current 'mae', and A[i].
            ato = total - mae - A[i];
            break; // Exit the loop, as the target split point has been identified.
        }
    }

    /*
     * These were previous debug console.log statements, now grouped in a multiline comment.
     * console.log("mae:%s", mae);
     * console.log("ato:%s", ato);
     * console.log("target:%s", i);
     * console.log("Ai:%s", A[i]);
     */


    // Calculate the absolute difference between the 'ato' and 'mae' sums.
    var   diff   =   Math.abs(  ato  -  mae  );

    // console.log("diff:%s", diff); // Another commented-out debug line.

    // The final result is the absolute difference between the element at the target index (A[i]) and 'diff'.
    var   result   =   Math.abs(  A[i]  -  diff  );

    // Output the final computed result to standard output.
    console.log(  "%s" ,  result  );

}


// Call the Main function with input read from standard input.
Main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .split("\n")
);