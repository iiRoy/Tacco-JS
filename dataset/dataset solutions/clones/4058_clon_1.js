var   Release   =    function   ()
{
    // This function initializes and returns a standard input reader.
    var   fs   =    require ( 'fs' ) ;

    // The stdin function reads from /dev/stdin or logs a message if provided.
    var   stdin   =    function   ( text )
    {
        if    ( text )
            console . log ( text ) ; // Output the provided text to console.

        return   fs . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
    }

    return   stdin ; // Return the configured stdin reader.
} ;


// Flag to control debug mode. Currently set to false.
var   debug   =    false ;

// Initialize the stdin function based on the debug flag.
// If debug is true, it would call a Debug() function (not provided here).
// Otherwise, it uses the Release() function.
var   stdin   =    debug   ?   Debug ( )   :   Release ( ) ;

// Read all input from stdin and split it by newlines.
var   input   =    stdin ( ) . split ( '\n' ) ;

// Parse the first line of input to get N and M.
var   NM   =    input . shift ( ) . split ( ' ' ) . map ( x   =>   parseInt ( x ) ) ;

// Extract N (number of items/nodes) from the parsed array.
var   N   =    NM [ 0 ] ;

// Extract M (number of relations/edges) from the parsed array.
var   M   =    NM [ 1 ] ;

// Process the remaining input lines to gather 'info' data.
// Each line is split by space and parsed into integers.
var   info   =    input . filter ( ( x ,   i )   =>   i   <   M ) . map ( x   =>   x . split ( ' ' ) . map ( y   =>   parseInt ( y ) ) ) ;


// Initialize a boolean flag 'h' to true. This will be used to track validity.
var   h   =    true ;

// Loop M times, processing each relation from the 'info' array.
for   ( var   i   =    0 ;   i   <   M ;   i ++ )
{
    // Pop the last element from 'info' array for current processing.
    var   t   =    info . pop ( ) ;

    // Extract L, R, and D values from the current relation 't'.
    var   L   =    t [ 0 ] ;
    var   R   =    t [ 1 ] ;
    var   D   =    t [ 2 ] ;


    // Filter 'info' to find relations where the first element matches L.
    var   l   =    info . filter ( x   =>   x [ 0 ]   ===   L ) ;

    // Iterate through the filtered 'l' relations.
    for   ( var   j   =    0 ;   j   <   l . length ;   j ++ )
    {
        var   n   =    l [ j ] ; // Current relation from 'l'.

        // Filter 'info' for relations connected to n[1] and R.
        // It checks both (n[1], R) and (R, n[1]) configurations.
        var   ll   =    info . filter ( x   =>   x [ 0 ]   ===   n [ 1 ]   &&   x [ 1 ]   ===   R ) . concat ( info . filter (
            x   =>   x [ 1 ]   ===   n [ 1 ]   &&   x [ 0 ]   ===   R
        ) ) . filter ( x   =>   ( n [ 2 ]   +   x [ 2 ]   -   D )   !==   0 ) ; // Additional check for a specific condition.

        // If any such 'll' relations are found, set 'h' to false and break.
        if   ( ll . length   >   0 )
        {
            h   =    false ;
            break ;
        }
    }

    // If 'h' has become false, break out of the main loop.
    if   ( ! h )
        break ;


    // Filter 'info' again, this time for relations where the second element matches L.
    var   l   =    info . filter ( x   =>   x [ 1 ]   ===   L ) ;

    // Iterate through this new set of 'l' relations.
    for   ( var   j   =    0 ;   j   <   l . length ;   j ++ )
    {
        var   n   =    l [ j ] ; // Current relation from this 'l'.

        // Similar filtering as before, but checking n[0] instead of n[1].
        var   ll   =    info . filter ( x   =>   x [ 0 ]   ===   n [ 0 ]   &&   x [ 1 ]   ===   R ) . concat ( info . filter (
            x   =>   x [ 1 ]   ===   n [ 0 ]   &&   x [ 0 ]   ===   R
        ) ) . filter ( x   =>   ( n [ 2 ]   +   x [ 2 ]   -   D )   !==   0 ) ;

        // If any such 'll' relations are found, set 'h' to false and break.
        if   ( ll . length   >   0 )
        {
            h   =    false ;
            break ;
        }
    }

    // If 'h' has become false, break out of the main loop.
    if   ( ! h )
        break ;

}


// Output 'Yes' if 'h' is still true, otherwise 'No'.
console . log ( h   ?   'Yes'   :   'No' ) ;