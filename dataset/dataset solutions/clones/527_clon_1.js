/*
 * This JavaScript code processes input from standard input.
 * It calculates a minimum value based on several conditions.
 * The logic involves array manipulation, sorting, and conditional comparisons.
 */

var    input    = require('fs').readFileSync(  '/dev/stdin',    'utf8'   )  ;


// Process the raw input string: trim whitespace and split into lines.
var arr =    input.trim()   .split(   "\n"   )    ;


/*
 * The first line of input contains three space-separated numbers: n, m, p.
 * We extract these, convert them to numbers, and store them.
 */
var nmp  =  arr .  shift() .  split(  " "  ) .  map(  Number  )  ;

// Adjusting 'n' as per problem requirements.
var n  =  nmp[0]  -  1  ;

// Storing 'm' and 'p' from the parsed array.
var m  =  nmp[1]  ;
var p  =  nmp[2]  ;


// Initialize an empty array to store processed data.
var ary = [ ] ;


// Loop 'm' times to process subsequent lines of input.
for ( var i = 0 ; i < m ; i++ )
{
    /*
     * Each line is a number 'd'.
     * Convert it to a number and add to 'ary' if it's not equal to 'p'.
     */
    var d = arr.shift() - 0 ;

    if ( d != p )
    {
        ary.push( d ) ;
    }
}


// Concatenate 'p' to the 'ary' array.
ary = ary.concat( p ) ;


// Sort the 'ary' array in ascending numerical order.
ary.sort(   function( a , b )
{
    return a - b ;
}   ) ;


// Initialize 'min' with a very large number (Infinity) for comparison.
var min = Infinity ;


/*
 * Iterate over each element 'v' and its index 'i' in the sorted 'ary' array.
 * Apply complex conditional logic to update 'min'.
 */
ary.forEach(  function( v , i )
{
    // Condition block for when 'v' is less than 'p'.
    if ( v < p )
    {
        if ( i != 0 )
        {
            min = Math.min( min , ( p - v ) * 2 + ( n - p + 1 ) + ary[i-1] ) ;
        }
    }


    // Condition block for when 'v' is equal to 'p'.
    if ( p == v )
    {
        if ( i == 0 )
        {
            min = Math.min( min , ary[ary.length - 1] - v ) ;
        }
        if ( i == ary.length - 1 )
        {
            min = Math.min( min , v - ary[0] ) ;
        }
        if ( i != ary.length - 1 )
        {
            min = Math.min( min , p + n - ary[i+1] + 1 ) ;
        }
        if ( i != 0 )
        {
            min = Math.min( min , n - p + 1 + ary[i-1] ) ;
        }
    }


    // Condition block for when 'v' is greater than 'p'.
    if ( p < v )
    {
        if ( i != ary.length - 1 )
        {
            min = Math.min( min , ( v - p ) * 2 + p + ( n - ary[i+1] + 1 ) ) ;
        }
    }
} ) ;


// Output the final calculated minimum value, multiplied by 100.
console.log( min * 100 ) ;

/* End of program */