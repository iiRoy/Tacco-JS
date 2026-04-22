var n;
/* This variable 'n' will store
 * the total number of operations
 * to be processed in the Main function. */
var str; /* This is a global array variable,
          * intended to store strings in a sorted manner. */


function binserch ( key )
{
    // Initialize the left boundary of the search space.
    var left = 0;

    // Initialize the right boundary of the search space.
    // Note: 'right' is implicitly declared as a global variable here,
    // which aligns with the original code's behavior.
    right = str.length - 1;


    var mid ; // Declaration of the 'mid' index variable for binary search.

    /*
     * The core binary search loop.
     * It continues as long as the 'left' pointer does not exceed the 'right' pointer.
     */
    while ( left <= right )
    {
        // Calculate the middle index, ensuring it's an integer.
        mid = Math.floor ( ( left + right ) / 2 ) ;

        // Check if the element at the middle index matches the target key.
        if ( str [ mid ] == key )
            return -1 ; // If found, return -1 as per the problem's specification.
        else if ( str [ mid ] < key ) // If the middle element is less than the key...
            left = mid + 1 ; // ...then discard the left half and search in the right half.
        else // If the middle element is greater than the key...
            right = mid - 1 ; // ...then discard the right half and search in the left half.
    }
    // If the key is not found, 'mid' will hold an index close to where the key would be inserted.
    return mid ;
}


/*
 * This is the primary function of the program.
 * It takes the entire input as a single string,
 * processes it, and performs operations on the 'str' array.
 */
function Main ( input )
{
    // Split the input string into an array of individual lines.
    input = input . split ( "\n" ) ;

    // Parse the first line of input to get the value for 'n' (number of operations).
    n = parseInt ( input [ 0 ] , 10 ) ;

    // Initialize the global 'str' array as an empty array.
    str = new Array ( 0 ) ;

    // Define string constants for operation types.
    var op1 = "insert" , op2 = "find" ;

    /*
     * Iterate through the input lines, starting from the second line (index 1),
     * up to 'n' operations.
     */
    for ( var i = 1 ; i <= n ; i ++ )
    {
        // Split the current input line by space to separate the operation type from its value.
        var a = input [ i ] . split ( " " ) ;

        // Check if the current operation is an 'insert' operation.
        if ( a [ 0 ] == op1 )
        {
            // If the 'str' array is currently empty, simply add the new element.
            if ( str . length === 0 )
            {
                str . push ( a [ 1 ] ) ; // Add the element to the end of the array.
            }
            else
            {
                /* If the array is not empty, use binary search to find
                 * the correct position for the new element to maintain sorted order. */
                var b = binserch ( a [ 1 ] ) ; // 'b' will be -1 if found, or an insertion index.

                if ( b >= 0 )
                {
                    // If str[b] is greater than the new element, insert before str[b].
                    if ( str [ b ] > a [ 1 ] )
                        str . splice ( b , 0 , a [ 1 ] ) ; // Insert 'a[1]' at index 'b'.
                    else // Otherwise, insert after str[b].
                        str . splice ( b + 1 , 0 , a [ 1 ] ) ; // Insert 'a[1]' at index 'b + 1'.
                }
            }
        }
        else // This block handles the 'find' operation.
        {
            /* Perform a binary search for the element.
             * If 'binserch' returns -1, it means the element was found. */
            if ( binserch ( a [ 1 ] ) === -1 )
                console . log ( "yes" ) ; // Output "yes" if the element is found.
            else // If 'binserch' returns any other value, the element was not found.
                console . log ( "no" ) ; // Output "no" if the element is not found.
        }
    }
}

// This line reads the input from standard input (/dev/stdin)
// using Node.js's file system module and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;