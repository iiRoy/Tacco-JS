/*
 * This JavaScript program processes numerical input to find
 * a specific difference based on frequency analysis of even and odd indexed numbers.
 * It identifies the most and second-most frequent elements in two separate sets
 * derived from the input and calculates a minimal modification count.
 */
function main  (  input  )
{
    // Split the input string by newline characters to get individual lines.
    var   args   =   input . split ( '\n' ) ;

    // Parse the first argument as the total count 'n'. This determines the loop limit.
    var n = parseInt ( args [ 0 ] ) ;

    // Split the second argument by space to get an array of numbers as strings.
    // These are the actual numerical values we will be processing.
    var an = args[1].split(' ');

    // Initialize two empty arrays: one for numbers at odd indices, and one for even indices.
    var on = [  ] ; // Stores numbers from odd positions.
    var en = [  ] ; // Stores numbers from even positions.


    // Loop through the input numbers from the first (index 0) up to 'n-1'.
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Check if the current index 'i' is an even number (including 0).
        if ( i % 2 == 0 )
        {
            // If the index is even, parse the corresponding number and add it to the 'en' array.
            en.push ( parseInt ( an [ i ] ) ) ;
        }
        else
        {
            // If the index is odd, parse the corresponding number and add it to the 'on' array.
            on.push ( parseInt ( an [ i ] ) ) ;
        }
    }

    // Sort both the even-indexed and odd-indexed number arrays in ascending order.
    // Sorting helps in efficiently counting frequencies later on.
    en.sort ( ) ;
    on.sort ( ) ;


    // Define a custom method 'mode2' on the Array prototype.
    // This method is designed to find the two most frequent elements (modes) in an array
    // along with their respective counts. It's a key part of the problem's logic.
    Array.prototype.mode2 = function ( ) {
        var arr = [ ] ; // An array to store frequency pairs [value, count].
        var prevValue ; // Used to track the last element processed during iteration.

        // Iterate over each element in the array to count occurrences.
        // The 'forEach' loop allows us to process each item.
        this.forEach ( function ( element , index ) {
            // If the current element is different from the previous one,
            // it means we've encountered a new unique number.
            if ( element != prevValue ) {
                // Add this new element with a count of 1 to the beginning of 'arr'.
                arr.unshift ( [ element , 1 ] ) ;
                prevValue = element ; // Update the previous value tracker.
            } else {
                // If the element is the same as the previous one,
                // increment the count of the most recently added element in 'arr'.
                arr [ 0 ] [ 1 ] += 1 ;
            }
        } ) ;

        // After counting all frequencies, sort the 'arr' array.
        // The primary sorting criterion is the count (second element of the inner array)
        // in descending order, so the most frequent elements come first.
        arr.sort ( function ( a , b ) {
            return b [ 1 ] - a [ 1 ] ; // Sort by frequency count (descending).
        } ) ;

        // Check if there is a second most frequent element.
        // If 'arr[1]' does not exist (meaning there's only one unique element or less),
        // we add a placeholder for the second mode with a count of 0.
        if ( ! arr [ 1 ] ) {
            arr.push ( [ null , 0 ] ) ; // Ensures that arr[1] always exists, even if it's a dummy.
        }

        // Return the top two modes and their counts as a nested array structure.
        // Example: [[mostFrequentValue, mostFrequentCount], [secondMostFrequentValue, secondMostFrequentCount]]
        return [ [ arr [ 0 ] [ 0 ] , arr [ 0 ] [ 1 ] ] , [ arr [ 1 ] [ 0 ] , arr [ 1 ] [ 1 ] ] ] ;
    }

    // Apply the 'mode2' function to the 'en' (even numbers) array
    // to find its most and second-most frequent elements.
    var evModes = en . mode2 ( ) ;

    // Apply the 'mode2' function to the 'on' (odd numbers) array
    // to find its most and second-most frequent elements.
    var odModes = on . mode2 ( ) ;

    var ans = 0 ; // Initialize the variable to store the final answer (minimum changes).

    // Now, we determine the minimum number of elements that need to be changed.
    // This depends on whether the most frequent element in the even set is the same
    // as the most frequent element in the odd set.

    // Case 1: The most frequent numbers in the even-indexed array and odd-indexed array are different.
    if ( evModes [ 0 ] [ 0 ] != odModes [ 0 ] [ 0 ] ) {
        // In this scenario, we can achieve the optimal state by changing all numbers
        // that are *not* the most frequent in their respective sets.
        // The total changes needed is 'n' minus the sum of the counts of their primary modes.
        ans = n - ( evModes [ 0 ] [ 1 ] + odModes [ 0 ] [ 1 ] ) ;
    }
    // Case 2: The most frequent numbers in both the even-indexed and odd-indexed arrays are the same.
    else {
        // If the primary modes are identical, we cannot use both of them.
        // We must change one of the sets to its second most frequent element.
        // We calculate two possibilities:
        //   a) Keep the primary mode of 'en', change 'on' to its second mode.
        //   b) Keep the primary mode of 'on', change 'en' to its second mode.
        // We choose the option that results in fewer changes (i.e., maximizes the sum of counts).
        ans = n - Math.max ( evModes [ 1 ] [ 1 ] + odModes [ 0 ] [ 1 ] , evModes [ 0 ] [ 1 ] + odModes [ 1 ] [ 1 ] ) ;
    }

    // Output the final calculated answer to the console.
    console.log ( ans ) ;
}

// This line reads the input from '/dev/stdin' (standard input),
// decodes it as UTF-8, and then passes it to the 'main' function to begin execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;