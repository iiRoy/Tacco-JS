/* This function processes a string by removing sequences of
   four or more identical digits (1s, 2s, or 3s) repeatedly
   until no such sequences remain. It then updates a global
   minimum length variable. */
function   bomb ( x )
{
    // Loop continues as long as patterns '1111+', '2222+', or '3333+' are found.
    while ( /1{4,}|2{4,}|3{4,}/ . test ( x ) )
    {
        /* Replace all occurrences of the identified patterns with an empty string,
           effectively removing them from the string 'x'. */
        x = x . replace ( /1{4,}|2{4,}|3{4,}/g , "" ) ;
    }

    // After processing, update the global minimum length if the current string 'x' is shorter.
    min = Math . min ( min , x . length ) ;
}


// Read the entire input from standard input as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace from the input and split it into an array of strings by newline.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Extract the first element, convert it to a number, and store it in N.
var N = Arr . shift ( ) - 0 ;

// Initialize an empty array to store numbers.
var arr = [ ] ;

// Loop N times to populate the 'arr' array.
for ( var i = 0 ; i < N ; i ++ )
{
    /* Take the next element from 'Arr', convert it to a number,
       and add it to the 'arr' array. */
    var v = Arr . shift ( ) - 0 ;
    arr . push ( v ) ;
}

// Initialize a global variable 'min' to positive infinity.
var min = Infinity ;

// Join the elements of 'arr' into a single string. (This variable 'str' is actually unused in the original logic, but must be kept.)
var str = arr . join ( "" ) ;

// Iterate N times to generate variations of the 'arr' array.
for ( var i = 0 ; i < N ; i ++ )
{
    // Create a shallow copy of the 'arr' array for modification.
    var A = arr . slice ( ) ;
    /* Create another shallow copy of the 'arr' array for a different modification.
       This ensures 'arr' itself remains unchanged for subsequent iterations. */
    var B = arr . slice ( ) ;

    // If 'i' is not the last index, modify 'A' by shifting an element right.
    if ( i < N - 1 ) A [ i ] = A [ i + 1 ] ;

    // If 'i' is not the first index, modify 'B' by shifting an element left.
    if ( i > 0 ) B [ i ] = B [ i - 1 ] ;


    // Convert array 'A' to a string and pass it to the 'bomb' function.
    bomb ( A . join ( "" ) ) ;

    // Convert array 'B' to a string and pass it to the 'bomb' function.
    bomb ( B . join ( "" ) ) ;
}

// Output the final minimum length found to the console.
console . log ( min ) ;