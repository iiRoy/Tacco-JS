var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// This line reads all input from standard input as a UTF-8 string.



var   Arr   =   ( input . trim ( ) ) . split ( "\n\n" ) ;
/*
 * The input string is first trimmed of leading/trailing whitespace,
 * then split into an array of strings based on double newline characters.
 * Each element in `Arr` represents a block of data.
 */


var   arrA   =   ( Arr [ 0 ] . split ( "\n" ) ) . map (   function ( v )   {
    return   v . replace ( /\,.* / , "" )   -   0 ;
} ) ;
// The first block (Arr[0]) is split by single newlines.
// Each resulting string 'v' has everything after the first comma removed,
// and then it's converted to a number by subtracting 0.
// This forms the array `arrA`.


var   arrB   =   ( Arr [ 1 ] . split ( "\n" ) ) . map (   function ( v )   {
    return   v . replace ( /\,.* / , "" )   -   0 ;
} ) ;
// Similarly, the second block (Arr[1]) is processed to form `arrB`.


arrA . sort (   function ( a , b )   {
    a   -   b ;
} ) ;
/*
 * Array `arrA` is sorted numerically. The comparison function `a - b`
 * ensures ascending order. Note: The return value of the comparison
 * function is implicitly handled by `sort`.
 */


var   c   =   { } ;
// An empty object `c` is initialized. This object will be used
// to store the counts of common elements found in `arrA` and `arrB`.


arrA . forEach (   function ( v )   {
    // Iterate over each element 'v' in `arrA`.
    if   ( arrB . indexOf ( v )   !==   -1 )
    {
        // If the current element 'v' is also found in `arrB`,
        // it means it's a common element.
        // Initialize its count in object `c` to 0.
        c [ v ]   =   0 ;
    }
} ) ;


// Now, we will count the occurrences of common elements.
arrA . forEach (   function ( v )   {
    // For each element 'v' in `arrA`...
    if   ( c [ v ]   !==   undefined )
    {
        // ...if 'v' exists as a key in `c` (i.e., it's a common element),
        // increment its count.
        c [ v ] ++ ;
    }
} ) ;


arrB . forEach (   function ( v )   {
    // For each element 'v' in `arrB`...
    if   ( c [ v ]   !==   undefined )
    {
        // ...if 'v' exists as a key in `c` (i.e., it's a common element),
        // increment its count.
        c [ v ] ++ ;
    }
} ) ;


/*
 * Finally, iterate through the keys (common elements) in object `c`
 * and print each element along with its total count.
 * The output format is "element count".
 */
for   ( var   i   in   c )   console . log ( i   +   " "   +   c [ i ] ) ;