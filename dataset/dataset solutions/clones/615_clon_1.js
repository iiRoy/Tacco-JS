var   input    =    require('fs')   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// This line reads data from standard input.
var   Arr    =    (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;

/*
 * The first element of the array 'Arr' is removed and converted to a number.
 * This variable 'n' is declared but not used later in this specific snippet.
 */
var   n    =    Arr   .   shift   (   )   -   0   ;

// Sorts the array 'Arr' numerically in ascending order.
Arr   .   sort   (   function   (   a   ,   b   )   {   return   a   -   b   ;   }   )   ;


var   ans    =    [   ]   ;   // Initialize an empty array to store calculated sums.


// This is the outer loop, iterating five times.
for   (   var   i   =   0   ;   i   <   5   ;   i   ++   )
{
        // This is the inner loop, starting from 'i + 1' to avoid duplicate pairs and self-pairing.
        for   (   var   j   =   i   +   1   ;   j   <   5   ;   j   ++   )
        {
                // Calculates the sum of Arr[i] and Arr[j], converting the result to a number, and pushes it to 'ans'.
                ans   .   push   (   (   Arr   [   i   ]   +   Arr   [   j   ]   )   -   0   )   ;

                // Adds the sum of Arr[j] and Arr[i] to 'ans'. This is mathematically redundant for simple sums but kept for cloning accuracy.
                ans   .   push   (   (   Arr   [   j   ]   +   Arr   [   i   ]   )   -   0   )   ;
        }
}

// Sorts the 'ans' array numerically in ascending order to find the required element.
ans   .   sort   (   function   (   a   ,   b   )   {   return   a   -   b   ;   }   )   ;

// Prints the element at index 2 of the sorted 'ans' array to the console.
console   .   log   (   ans   [   2   ]   )   ;