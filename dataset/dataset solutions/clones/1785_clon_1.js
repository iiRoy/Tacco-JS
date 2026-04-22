"use strict"
// This line enforces strict mode for the entire script.
// It helps in writing cleaner code and catching common coding mistakes.


// --- Input Processing Section ---

/*
 *  Initializes the input stream by reading from standard input.
 *  Uses Node.js 'fs' module to read the entire file synchronously.
 *  The '/dev/stdin' path is standard for reading from stdin in many environments.
 */
var    input    = require("fs") . readFileSync( "/dev/stdin" ,  "utf8" ) ;


/*
 *  Splits the entire input string into an array of strings.
 *  The split occurs on either spaces or newline characters.
 *  'cid' serves as an index to keep track of the current position in the 'cin' array.
 */
var   cin   = input . split( / |\n/ ) ,   cid   =  0 ;


// --- Helper Functions for Input Parsing ---

/*
 *  Retrieves the next element from the 'cin' array and converts it to a number.
 *  The '++' operator increments 'cid' after the current element is accessed.
 *  // Original comment: number一個取得 (Get one number)
 */
function next()
{
    return  +cin[ cid++ ] ;
}


/*
 *  Retrieves the next element from the 'cin' array as a string.
 *  // Original comment: 文字列一個取得 (Get one string)
 */
function nextstr()
{
    return cin[ cid++ ] ;
}


/*
 *  Retrieves the next element and converts it to a BigInt.
 *  This is useful for handling very large integer values.
 *  // Original comment: BigInteger一個取得 (Get one BigInteger)
 */
function nextbig()
{
    return BigInt( cin[ cid++ ] ) ;
}


/*
 *  Retrieves 'n' elements from the 'cin' array.
 *  If 'a' is true, returns them as an array of strings.
 *  Otherwise, converts them to numbers and returns an array of numbers.
 *  // Original comment: 長さnの配列として取得。aは文字列フラグ (Get as an array of length n. 'a' is a string flag)
 */
function nexts( n ,   a )
{
    return  a  ?  cin . slice( cid ,   cid += n )  :  cin . slice( cid ,   cid += n ) . map( a  =>  +a ) ;
}


/*
 *  Retrieves 'n' elements from the 'cin' array and converts them to BigInts.
 *  Returns an array of BigInts.
 *  // Original comment: 長さnのBigInt配列として取得。 (Get as a BigInt array of length n)
 */
function nextsbig( n )
{
    return cin . slice( cid ,   cid += n ) . map( a  =>  BigInt( a ) ) ;
}


/*
 *  Reads a 2D array (matrix) of dimensions h x w.
 *  'h' is the number of rows, 'w' is the number of columns per row.
 *  If 'a' is true, elements are stored as strings. Otherwise, as numbers.
 *  // Original comment: w個ずつを組にして長さhの配列。aは文字列フラグ。 (An array of length h, grouped by w elements. 'a' is a string flag.)
 */
function nextm( h ,   w ,   a )
{
    var   r   =  [] ,   i   =  0 ;

    if  ( a )
        for  ( ;   i  <  h ;   i++ )
            r . push( cin . slice( cid ,   cid += w ) ) ;
    else
        for  ( ;   i  <  h ;   i++ )
            r . push( cin . slice( cid ,   cid += w ) . map( a  =>  +a ) ) ;

    return  r ;
}


/*
 *  Dynamically creates a multi-dimensional array using 'eval'.
 *  'v' is the initial value for the innermost array elements.
 *  Subsequent arguments define the dimensions of the array.
 *  This function is powerful but should be used with caution due to 'eval'.
 */
function xArray( v )
{
    var   a   =  arguments ,   l   =  a . length ,
          r   =  "Array(a["  +  --l  +  "]).fill().map(x=>{return "  +  v  +  ";})" ;

    while  ( --l )
        r   =  "Array(a["  +  l  +  "]).fill().map(x=>"  +  r  +  ")" ;

    return  eval( r ) ;
}


// --- Main Program Execution ---

// Calls the main function, converts its return value to a string, and prints it to the console.
console . log( main() . toString() ) ;


/*
 *  The primary function of the program.
 *  It reads a string from input and returns its first three characters.
 */
function main()
{
    let   S   =  nextstr() ;


    // Returns the substring starting from index 0, up to (but not including) index 3.
    return S . substring( 0 , 3 ) ;



}