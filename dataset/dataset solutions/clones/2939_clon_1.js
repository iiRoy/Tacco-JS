/*
 * Main function to process input and calculate a sum.
 * This function handles all the core logic of the program.
 */
function     Main(   input   )
{
    // Process the raw input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split into an array of lines based on newline characters.
    input =   input
        .  trim ( )
        .  split (   "\n"   )
        ;

    // The first line contains N and M, separated by a space.
    // Split the first line to get these two values.
    tmp =   input[ 0 ] . split ( " " );

    // Parse N as an integer (base 10). N represents a count.
    var   N   =   parseInt (   tmp[ 0 ]  ,  10   ) ;
    // Parse M as an integer (base 10). M represents another count.
    var   M   =   parseInt (   tmp[ 1 ]  ,  10   ) ;

    // Initialize an empty array A. This array will store numbers for sorting.
    var   A   =   [  ] ;

    // Populate array A from the second line of input.
    // The second line (input[1]) contains N space-separated numbers.
    for (   var   i   =   0  ;   i   <   N  ;   i++   )
    {
        // Parse each number as an integer and add it to array A.
        A [   i   ]   =   parseInt (   input[ 1 ] . split ( " " ) [ i ]  ,  10   ) ;
    }


    // Process subsequent M+1 lines of input, starting from the third line (index 2).
    // Each of these lines (from j=2 to M+1) contains two space-separated numbers: B and C.
    for (   var   j   =   2  ;   j   <=   M   +   1  ;   j++   )
    {
        // Parse B as an integer (base 10). B represents a repetition count.
        var   B   =   parseInt (   input[ j ] . split ( " " ) [ 0 ]  ,  10   ) ;
        // Parse C as an integer (base 10). C represents a value to be added.
        var   C   =   parseInt (   input[ j ] . split ( " " ) [ 1 ]  ,  10   ) ;

        // Add the value C to array A, B times.
        for (   var   i   =   0  ;   i   <   B  ;   i++   )
        {
            A . push (   C   ) ; // Append C to the end of array A.
        }
    }

    // Call the QuickSort function to sort the array A.
    // The sort will be performed on the entire array, from index 0 to A.length - 1.
    quickSort (   0  ,  A . length   ) ;


    /*
     * This is the QuickSort function.
     * It sorts a portion of the global array 'A' in ascending order.
     *
     * @param {number} startID - The starting index of the sub-array to be sorted (inclusive).
     * @param {number} endID   - The ending index of the sub-array to be sorted (exclusive).
     */
    function        quickSort (   startID  ,  endID   )
    {
        // Select a pivot element. Here, the middle element is chosen as the pivot.
        var   pivot   =   A [   Math . floor (   (   startID   +   endID   )   /   2   )   ] ;

        // Initialize left and right pointers for partitioning.
        var   left    =   startID ;
        var   right   =   endID ;

        // Partition the array around the pivot.
        while (   true   )
        {
            // Move the left pointer to the right until an element greater than or equal to the pivot is found.
            while (   A [   left   ]   <   pivot   )
            {
                left++ ;
            }
            // Move the right pointer to the left until an element less than or equal to the pivot is found.
            while (   pivot   <   A [   right   ]   )
            {
                right-- ;
            }

            // If the pointers have crossed or met, the partitioning for this segment is complete.
            if (   right   <=   left   )
            {
                break ; // Exit the partitioning loop.
            }

            // If pointers haven't crossed, swap the elements at left and right pointers.
            // This places smaller elements to the left of the pivot and larger to the right.
            var   tmp   =   A [   left   ] ;
            A [   left   ]   =   A [   right   ] ;
            A [   right   ]   =   tmp ;

            // Move pointers one step inward to continue partitioning.
            left++ ;
            right-- ;
        }

        // Recursively sort the left sub-array if it contains more than one element.
        if (   startID   <   left   -   1   )
        {
            quickSort (   startID  ,  left   -   1   ) ;
        }
        // Recursively sort the right sub-array if it contains more than one element.
        if (   right   +   1   <   endID   )
        {
            quickSort (   right   +   1  ,  endID   ) ;
        }
    }


    // Calculate the output sum by iterating through the sorted array A.
    var   output   =   0 ; // Initialize the sum.
    var   k      =   0 ; // Counter for positive elements added to the sum.

    // Iterate through the array A from the end to the beginning.
    // This assumes A is sorted in ascending order, so larger values are at the end.
    for (   var   i   =   A . length  ;   i   >=   0  ;   i--   )
    {
        // Only consider positive elements.
        if (   A [   i   ]   >   0   )
        {
            output   +=   A [   i   ] ; // Add the positive element to the total output.
            k++ ; // Increment the count of positive elements added.
        }
        // Stop adding elements once N positive elements have been collected.
        if (   k   ==   N   )
        {
            break ; // Exit the loop.
        }
    }

    // Print the final calculated output sum to the console.
    console . log (   output   ) ;
}

// Read input from standard input (stdin) synchronously.
// The input is read as UTF-8 encoded text.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"  ,  "utf8"   )   ) ;