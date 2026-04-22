// This script processes input data to calculate a minimum value based on specific conditions.
var     input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8'    ) ;

// The input is read, trimmed, and split into lines.
var    arr    =    input.trim ( ) .split ( "\n" ) ;

// The first line contains three numbers: n, m, and p.
var    nmp    =    arr . shift ( ) . split ( " " ) . map ( Number ) ;

var    n = nmp [ 0 ] ; // Total count
var m = nmp [ 1 ] ; // Number of elements to process
var    p = nmp [ 2 ] ; // A specific reference point

// Initialize an array to store filtered values.
var    ary = [ ] ;

// Loop through 'm' elements from the input array.
for ( var i = 0 ; i < m ; i ++ )
{
    // Convert the shifted element to a number.
    var    d = arr . shift ( ) - 0 ;

    // If 'd' is not equal to 'p', add it to 'ary'.
    if ( d != p )
    {
        ary . push ( d ) ;
    }
}

// Ensure 'p' is included in the array for calculations.
ary = ary . concat ( p ) ;

// Sort the array in ascending order.
ary . sort ( function ( a , b ) { return a - b ; } ) ;


// Initialize 'min' with a very large value.
var min = Infinity ;

// Iterate over each element in the sorted array.
ary . forEach ( function ( v , i )
{
    // Case 1: Current value 'v' is less than 'p'.
    if ( v < p )
    {
        // If not the first element, calculate a potential minimum.
        if ( i != 0 )
        {
            min = Math . min ( min , ( p - v ) * 2 + ( n - p + 1 ) + ary [ i - 1 ] ) ;
        }
    }

    // Case 2: Current value 'v' is equal to 'p'.
    if ( p == v )
    {
        // If it's the first element, consider the distance to the last.
        if ( i == 0 )
        {
            min = Math . min ( min , ary [ ary . length - 1 ] - v ) ;
        }

        // If it's the last element, consider the distance to the first.
        if ( i == ary . length - 1 )
        {
            min = Math . min ( min , v - ary [ 0 ] ) ;
        }

        // If not the last element, calculate a potential minimum involving the next element.
        if ( i != ary . length - 1 )
        {
            min = Math . min ( min , p + n - ary [ i + 1 ] + 1 ) ;
        }

        // If not the first element, calculate a potential minimum involving the previous element.
        if ( i != 0 )
        {
            min = Math . min ( min , n - p + 1 + ary [ i - 1 ] ) ;
        }
    }

    // Case 3: Current value 'v' is greater than 'p'.
    if ( p < v )
    {
        // If not the last element, calculate a potential minimum.
        if ( i != ary . length - 1 )
        {
            min = Math . min ( min , ( v - p ) * 2 + p + ( n - ary [ i + 1 ] + 1 ) ) ;
        }
    }
} ) ;

// Output the final calculated minimum, scaled by 100.
console . log ( min * 100 ) ;