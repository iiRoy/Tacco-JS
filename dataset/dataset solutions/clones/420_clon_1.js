/*
 * This function attempts to 'search' for a specific configuration
 * within the 'ary' array based on the input 'x' and global 'm'.
 * It returns true if a certain condition is met, false otherwise.
 *
 * @param {number} x - The target value for comparison.
 * @returns {boolean} - True if the condition is met, false otherwise.
 */
function  seach ( x )
{
    // Initialize a flag to indicate success or failure.
    var  flag  =  true ;

    // Counter for a specific event.
    var  cnt   =  0 ;

    // Accumulator for array elements.
    var  sum   =  0 ;

    // Loop through each element of the global 'ary' array.
    for  ( var  i = 0 ;  i < ary.length ;  i++ )
    {
        // Check if the current element 'ary[i]' is greater than 'x'.
        if  ( x < ary[i] )
        {
            flag  =  false ;  // Set flag to false.
            break ;          // Exit the loop early.
        }
        // Check if the sum of current 'sum' and 'ary[i]' equals 'x'.
        else  if  ( sum + ary[i] == x )
        {
            sum  =  0 ;  // Reset sum.
            // If it's not the last element, increment counter.
            if  ( i != ary.length - 1 )
            {
                cnt++ ;
            }
        }
        // Check if the sum of current 'sum' and 'ary[i]' is greater than 'x'.
        else  if  ( sum + ary[i] > x )
        {
            sum  =  ary[i] ; // Reset sum to current element.
            cnt++ ;          // Increment counter.
        }
        // Check if the sum of current 'sum' and 'ary[i]' is less than 'x'.
        else  if  ( sum + ary[i] < x )
        {
            sum  +=  ary[i] ; // Add current element to sum.
        }

        // Check if the counter has reached the global 'm' value.
        if  ( cnt == m )
        {
            flag  =  false ; // Set flag to false.
            break ;          // Exit the loop early.
        }
    }

    // Return the final state of the flag.
    return  flag ;
}


// --- Main program execution starts here ---

// Import the 'fs' module for file system operations.
// Read input from standard input, encoded as UTF-8.
var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Trim whitespace from the input and split it into an array of lines.
var  arr   =  input . trim ( ) . split ( "\n" ) ;


// Main loop to process multiple test cases until "0 0" is encountered.
while  ( true )
{
    // Get the first line from the array, which contains 'm' and 'n'.
    var  mn  =  arr.shift ( ) ;

    // Check for the termination condition.
    if  ( mn  ==  "0 0" )
    {
        break ; // Exit the loop if "0 0" is found.
    }

    // Split the 'mn' string by space and convert parts to numbers.
    mn  =  mn . split ( " " ) . map ( Number ) ;

    // Assign the first number to 'm'.
    var  m  =  mn[0] ;

    // Assign the second number to 'n'.
    var  n  =  mn[1] ;

    // Initialize an empty array for 'ary'.
    var  ary  =  [ ] ;

    // Populate 'ary' with 'n' elements, converting them to numbers.
    while  ( n-- )
    {
        ary . push ( arr . shift ( ) - 0 ) ;
    }


    // Initialize the lower bound for binary search.
    var  L  =  0 ;

    // Initialize the upper bound for binary search.
    var  R  =  1500000 ;


    // Perform a binary search.
    while  ( true )
    {
        // Calculate the middle point.
        var  middle  =  Math . floor ( ( L + R ) / 2 ) ;

        // Call the 'seach' function with the middle value.
        var  flag  =  seach ( middle ) ;

        // Adjust search bounds based on the 'flag' result.
        if  ( flag )
        {
            R  =  middle - 1 ; // If true, try smaller values.
        }
        else
        {
            L  =  middle + 1 ; // If false, try larger values.
        }

        // Check for termination condition of binary search.
        if  ( L  >  R )
        {
            break ; // Exit binary search if bounds cross.
        }
    }

    // Output the result of the binary search.
    console . log ( R + 1 ) ;
}