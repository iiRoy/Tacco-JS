var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; /*
 * This script reads input from standard input, processes it,
 * and then prints a calculated minimum value multiplied by 100.
 */


var arr = input . trim ( ) . split ( "\n" ) ;


// The first line contains three space-separated numbers: N, M, P.
var nmp = arr . shift ( ) . split ( " " ) . map ( Number ) ;


var n = nmp [ 0 ] - 1 ; // N is adjusted
var m = nmp [ 1 ] ;     // M is the count of subsequent numbers
var p = nmp [ 2 ] ;     // P is a special value


var ary = [ ] ;         // Initialize an array to store numbers different from P


/*
 * Loop M times to read subsequent numbers.
 * Each number 'd' is checked against 'p'.
 * If 'd' is not equal to 'p', it's added to 'ary'.
 */
for ( var i = 0 ; i < m ; i ++ )
{
    var d = arr . shift ( ) - 0 ; // Read and convert to number

    if ( d != p )
    {
        ary . push ( d ) ;
    }
}


// After the loop, add the value 'p' itself to the array.
ary = ary . concat ( p ) ;


// Sort the array in ascending numerical order.
ary . sort ( function ( a , b )
{
    return a - b ;
} ) ;


var min = Infinity ; // Initialize 'min' with a very large number


/*
 * Iterate through the sorted array 'ary' using forEach.
 * For each element 'v' at index 'i', calculate potential minimums
 * based on its relation to 'p'.
 */
ary . forEach ( function ( v , i )
{

    // Case 1: Current value 'v' is less than 'p'
    if ( v < p )
    {
        if ( i != 0 )
        {
            min = Math . min ( min , ( p - v ) * 2 + ( n - p + 1 ) + ary [ i - 1 ] ) ;
        }
        else
        {
            min = Math . min ( min , ( p - v ) * 2 + ( n - p + 1 ) ) ;
        }
    }


    // Case 2: Current value 'v' is equal to 'p'
    if ( p == v )
    {
        if ( i == 0 )
        {
            min = Math . min ( min , ary [ ary . length - 1 ] - v ) ;
        }

        if ( i == ary . length - 1 )
        {
            min = Math . min ( min , v - ary [ 0 ] ) ;
        }

        if ( i != ary . length - 1 )
        {
            min = Math . min ( min , p + n - ary [ i + 1 ] + 1 ) ;
        }

        if ( i != 0 )
        {
            min = Math . min ( min , n - p + 1 + ary [ i - 1 ] ) ;
        }
    }


    // Case 3: Current value 'v' is greater than 'p'
    if ( p < v )
    {
        if ( i != ary . length - 1 )
        {
            min = Math . min ( min , ( v - p ) * 2 + p + ( n - ary [ i + 1 ] + 1 ) ) ;
        }
        else
        {
            min = Math . min ( min , ( v - p ) * 2 + p ) ;
        }
    }

} ) ;


// Finally, print the calculated minimum value, multiplied by 100.
console . log ( min * 100 ) ;