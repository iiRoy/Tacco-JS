/*
 * This JavaScript file implements a function to find the maximum difference
 * between an element and a preceding minimum element in an array,
 * and counts how many times this maximum difference occurs.
 *
 * The input is expected to be read from standard input.
 */

function     Main(    s    )
{
    // The input 's' is initially a single string containing multiple lines.
    // Split the input string into an array of strings, where each element is a line.
    s   =   s.split( "\n" ) ;

    // The first line of input (s[0]) contains space-separated integers.
    // Split this line by spaces, then map each string part to an integer.
    s[  0  ]    =    s[  0  ].split(    " "    )    .map(    a    =>    parseInt(    a    )    )   ;


    // The first number on the first line represents the total count of elements, 'n'.
    const   n   =   s[0][0] ;


    // The second line of input (s[1]) contains the array 'a' of space-separated integers.
    // Similar to s[0], split and parse these into an array of numbers.
    var     a   =   s[1].split(    " "    )    .map(    a    =>    parseInt(a)    )   ;


    // Initialize 'min' with the first element of array 'a'.
    // This variable will track the minimum value encountered so far.
    var     min     =   a[0]    ;

    // 'now' stores the maximum difference found between an element and a preceding minimum.
    // Initialize it to 0.
    var     now     =   0   ;


    // 'ans' counts how many times the maximum difference ('now') is achieved.
    // Initialize it to 0.
    var     ans     =   0   ;


    // Begin iterating through the array 'a' starting from the second element (index 1).
    // The loop continues as long as 'i' is less than 'n'.
    for (  var  i  =  1  ;  i  <  n  ;  i++  )
    {
        // Calculate the difference between the current element a[i] and the current minimum 'min'.
        // Store this in a temporary variable 'tmp'.
        tmp  =  a[i]  -  min ;

        /*
         * Evaluate the calculated difference 'tmp' against the current maximum difference 'now'.
         * There are three possible scenarios:
         * 1. A new maximum difference is found.
         * 2. The current difference equals the existing maximum difference.
         * 3. The current element is smaller than the current minimum, updating 'min'.
         */
        if  (  tmp  >  now  )
        {
            // If 'tmp' is greater than 'now', it means we've found a new, larger maximum difference.
            // Update 'now' to this new maximum.
            now  =  tmp ;
            // Since it's a new maximum, reset 'ans' to 1 (this is the first occurrence of this new max).
            ans  =  1   ;
        }
        else    if  (  tmp  ===  now  )
        {
            // If 'tmp' is exactly equal to 'now', it means we've found another occurrence
            // of the current maximum difference.
            // Increment 'ans' to reflect this.
            ans++ ;
        }
        else    if  (  min  >  a[i]  )
        {
            // If 'tmp' is neither greater than nor equal to 'now', it implies 'tmp' < 'now'.
            // In this case, we also check if the current element 'a[i]' is smaller than 'min'.
            // If it is, update 'min' to 'a[i]' because we've found a new smaller minimum for future calculations.
            min  =  a[i]  ;
        }
    }


    // After the loop completes, 'ans' holds the total count of times the
    // maximum difference was achieved.
    // Print this result to the console.
    console.log(    ans    )   ;
}


// This line calls the Main function, providing the input.
// It reads the entire content of "/dev/stdin" as a UTF-8 string
// using Node.js's file system module.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;