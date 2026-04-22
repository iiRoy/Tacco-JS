/*
 * This is a JavaScript file for competitive programming.
 * It provides utility functions for reading input and a main function
 * to solve a specific problem.
 */
"use strict" // Enforces strict mode for cleaner code.


//  Function to create an input reader utility.
//  It reads from stdin, processes the input, and provides methods
//  to retrieve data sequentially.
const create  =  ( )  =>    {
    // Read the entire input from /dev/stdin, decode as UTF-8,
    // trim leading/trailing whitespace, and split by newlines.
    const input =require("fs").readFileSync("/dev/stdin",  "utf8"  ).trim().split("\n") ;

    //  The 'res' object acts as an iterator for the input lines.
    const res = {
        "list"   :  input, // Stores all input lines as an array.
        "index"  :  0,     // Current position in the 'list'.
        "max"    :  input.length, // Total number of input lines.

        /**
         * Checks if there are more elements to read.
         * @returns {boolean} True if more elements are available, false otherwise.
         */
        "hasNext": function( )  { return  this.index < this.max },

        /**
         * Retrieves the next element from the input list.
         * Throws an error if no more elements are available.
         * @returns {string} The next line from the input.
         */
        "next"   :  function( )  {
            if  ( !this.hasNext() )
            {
                throw  "ArrayIndexOutOfBoundsException" ;
            }
            else
            {
                return  this.list[ this.index++ ] ;
            }
        }
    } ;
    return  res ; // Return the created input reader object.
}

// Instantiate the input reader.
const o  =  create() ;

//  Define utility functions for easier input consumption.
//  Each function calls a method on the 'o' (input reader) object.

//  Gets the next raw string line.
const next = ( )  =>  o.next() ;

//  Gets the next integer.
const nextInt = ( )  =>  parseInt(o.next()) ;

//  Gets the next line, split by spaces, as an array of strings.
const nextStrArray = ( )  =>  o.next().split(" ") ;

//  Gets the next line, split by spaces, and maps each part to an integer.
const nextIntArray = ( )  =>  o.next().split(" ").map( el => parseInt(el) ) ;

//  Gets the next line as an array of characters.
const nextCharArray = ( )  =>  o.next().split("") ;

//  Checks if there is more input available.
const hasNext = ( )  =>  o.hasNext() ;

//  Custom output function that simply logs to the console.
const myout = ( ...x )  =>  console.log(...x) ;


/**
 * The main function where the problem logic resides.
 * It reads two integers, x and y, and calculates 'ans' based on specific conditions.
 */
const Main = ( )  =>  {
    // Read two integers from the input array.
    const [x,y] = nextIntArray() ;

    // Initial calculation of 'ans' based on absolute differences.
    let ans  =  Math.abs(Math.abs(x)  -  Math.abs(y)) ;

    // Condition 1: If x and y have different signs.
    if  ( x * y < 0 )
    {
        ans += 1 ;
    }
    // Condition 2: Specific cases involving zero.
    // (x positive, y zero) OR (x zero, y negative)
    else if ( ( x > 0  &&  y == 0 )  ||  ( x == 0  &&  y < 0 ) )
    {
        ans += 1 ;
    }
    // Condition 3: If x is strictly less than y.
    else if ( x < y )
    {
        ans += 2 ;
    }

    // Output the final calculated answer.
    console.log(ans) ;
}

// Execute the main function to start the program.
Main() ;
// End of script.