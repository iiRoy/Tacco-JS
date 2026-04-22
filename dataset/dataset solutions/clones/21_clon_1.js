// This is an introductory comment for the entire script file.
// It handles some input processing and then performs calculations.

var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;


var array = ( input . trim ( ) ) . split ( "\n" ) ;

// Loop through each line of the input array.
for ( var i = 0 ; i < array . length ; i ++ ) {

    var splited = array [ i ] . split ( " " ) ;

    // Sort the split numbers in descending order.
    splited . sort ( function ( d , e ) {
        return e - d
    } )

    console . log ( splited ) ;

    // Call the test function with the sorted data.
    test ( splited ) ;

}



// This function performs GCD and LCM calculations.
function test ( data ) {

    var a = data [ 0 ] ;
    var b = data [ 1 ] ;

    // c_multi is for LCM, gcd is for GCD.
    // Calculate the Greatest Common Divisor (GCD).
    var x = a ;
    var y = b ;
    var z ;

    while ( ( z = x % y ) != 0 ) {
        x = y ;
        y = z ;
    }

    var gcd = y ;

    // Calculate the Least Common Multiple (LCM).
    var lcm = a * b / gcd ;

    // Output the results to the console.
    console . log ( lcm + " " + gcd ) ;

}