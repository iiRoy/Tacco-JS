/* This JavaScript file computes a specific value 'a'
 * based on an input 's'. It utilizes a recursive
 * backtracking approach to find a minimal 'k'.
 *
 * Version: 1.0.0
 * Last Modified: 2023-10-27
 *
 * Note: This code is auto-generated for clone demonstration.
 */

// The primary entry point function for the program.
function   Main ( s )
{

    // Type coercion for the input 's'.
    // Ensures 's' is treated as an integer.
    s   |=   0 ;

    // Declaration and initialization of an array 'arr'.
    // These are predefined constants used in the computation.
    var   arr   =   [   1  ,  6  ,  9  ,  36  ,  81  ,  216  ,  729  ,  1296  ,  6561  ,  7776  ,  46656  ,  59049   ]   ;


    // Initialization of variable 'a'.
    // 'a' stores the minimum 'k' found so far.
    // It's initialized to a very large number using bit shift.
    var   a   =   1   <<   29   ;


    // Initial call to the recursive helper function 'fu'.
    // Starts the computation with k=0, n=s, and i=11 (last index).
    fu ( 0 , s , 11 ) ;



    // Recursive helper function 'fu'.
    // k: current count, n: remaining value, i: current index in 'arr'.
    function   fu ( k , n , i )
    {

        // Base case: if 'n' is zero or negative, a path has completed.
        if   (   n   <=   0   )
        {
            // Check if the current 'k' is better than the global minimum 'a'.
            if   (   k   <   a   )
            {
                // Update 'a' with the new minimum 'k'.
                a   =   k   ;
            }
        }
        // Recursive step: if 'n' is still positive and 'k' is potentially optimal.
        else   if   (   k   <   a   )
        {

            // Find the largest element in 'arr' (from index 'i' downwards)
            // that is less than or equal to the current 'n'.
            while   (   arr [ i ]   >   n   )
            {
                i--   ; // Decrement index
            }

            // First recursive call: explore using arr[i].
            // Increment 'k', reduce 'n' by arr[i], keep current 'i'.
            fu ( k   +   1 ,   n   -   arr [ i ] ,   i ) ;


            // Second recursive call (optional): explore using arr[i-1] if possible.
            // This is a branch in the decision tree.
            if   (   i   >   1   )
            {
                fu ( k   +   1 ,   n   -   arr [ i - 1 ] ,   i   -   1 ) ;
            }
        }

    } // End of fu function definition


    // Output the final minimum 'a' value to the console.
    console . log ( a ) ;

} // End of Main function definition

// --- Program Execution Start ---
// Reads input from standard input (/dev/stdin)
// and passes it as a UTF-8 string to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;

// End of file.