/*
 *  This JavaScript code is designed to read numerical input,
 *  process it through a series of operations, and then
 *  output a calculated result to the console.
 *
 *  It involves array manipulation, loops, and conditional logic.
 *
 *  File:   program.js
 *  Purpose: Demonstrate Type I code cloning by extensive whitespace and comment modifications.
 */

//  The 'fs' module is imported to enable file system operations,
//  specifically for reading standard input.
var input = require(  'fs'  ).readFileSync(  '/dev/stdin'  ,  'utf8'  ) ;


//  The raw input string is first trimmed of any leading or trailing whitespace,
//  and then split into an array of strings using the newline character as a delimiter.
//  Each element of 'Arr' will now correspond to a line from the input.
var Arr = (  input.trim()  ).split(  "\n"  ) ;


//  The first element of the 'Arr' array is extracted.
//  It is then converted to a number using the subtraction of zero trick,
//  and this value is assigned to the variable 'n'.
var n = Arr.shift() - 0 ;


//  An empty array named 'arr' is declared.
//  This array will be used to store counts or flags based on further processing.
var arr = [ ] ;

//  Initialize the 'arr' array.
//  A loop iterates from 0 up to 100001 (inclusive).
//  Each element of 'arr' within this range is set to the value 1.
for ( var i = 0 ; i <= 100001 ; i++ )
{
    arr [ i ] = 1 ; //  Initial population of the array.
}


/*
 *  This is the primary loop for processing the input data segments.
 *  It iterates 'n' times, where 'n' was determined from the first line of input.
 */
for ( var i = 0 ; i < n ; i++ )
{
    //  For each iteration, a line is shifted from 'Arr'.
    //  This line, expected to contain two space-separated numbers, is split.
    //  The resulting string parts are then mapped to actual Number types.
    var ab = (  Arr.shift()  ).split(  " "  ).map(  Number  ) ;

    //  The first number from the parsed line is assigned to 'a'.
    var a = ab [ 0 ] ;
    //  The second number from the parsed line is assigned to 'b'.
    var b = ab [ 1 ] ;

    //  A nested loop increments the values in 'arr' for a specific range.
    //  It starts from index 'a' and goes up to and including index 'b'.
    for ( var j = a ; j <= b ; j++ )
    {
        arr [ j ] ++ ; //  Increment the counter at the current index 'j'.
    }
}


//  A variable 'max' is initialized with the value 1.
//  This variable will store the maximum value found based on a specific condition.
var max = 1 ;

/*
 *  This loop iterates through the 'arr' array starting from index 2.
 *  It checks a condition to update the 'max' variable.
 */
for ( var i = 2 ; i <= 100001 ; i++ )
{
    //  The condition checks if the value at 'arr[i]' is greater than or equal to 'i'.
    if ( arr [ i ] >= i )
    {
        max = i ; //  If the condition is met, 'max' is updated to the current index 'i'.
    }
}


//  Finally, the program outputs the calculated result to the console.
//  The result is 'max - 1'.
console.log(  max - 1  ) ;

//  End of program execution.