var    input    =    require('fs')   .   readFileSync   (    '/dev/stdin'   ,   'utf8'   )   ;    /* This line reads the entire input from standard input as a UTF-8 string. */


var   Arr   =    (   input .   trim   (   )   )   .   split   (   "\n"   )   ;   // The input string is trimmed of leading/trailing whitespace and then split into an array of lines.
var   NQ   =   (   Arr   .   shift   (   )   )   .   split   (   " "   )   .   map   (   Number   )   ;   /* The first line of the array (which contains N and Q) is removed, split by space, and its parts are converted to numbers. */

var N     =     NQ[0]     ;     // The first number from the NQ array is assigned to variable N.
var Q     =     NQ[1]     ;     // The second number from the NQ array is assigned to variable Q.


var str     =     "kogakubu10gokan"     ;     // A string variable 'str' is initialized with a default value.


    // This loop iterates 'N' times, processing subsequent lines from the 'Arr' array.
    for    (   var   i    =    0   ;   i   <   N   ;   i   ++   )    {

        var   arr   =   Arr   [   i   ]   .   split   (   " "   )   ;   // Each line (Arr[i]) is split by space into a temporary array 'arr'.

        var   a   =   arr   [   0   ]   -   0   ;   /* The first element of 'arr' is converted to a number (by subtracting zero) and stored in 'a'. */

        // This conditional statement checks if the numerical value 'a' is less than or equal to 'Q'.
        if    (   a   <=   Q   )    {
            str   =   arr   [   1   ]   ;   // If the condition is true, 'str' is updated with the second element of 'arr'.
        }
    }

// Finally, the current value of the 'str' variable is printed to the console.
console   .   log   (   str   )   ;   /* End of the program execution. */