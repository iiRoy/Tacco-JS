/* This is a Type I clone of an original JavaScript file.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered.
 */

"use strict" ; // Enforces strict mode for cleaner code and fewer errors.


const   create  =  ( )  =>    {


        // Reads input from standard in, processes it, and returns an iterator-like object.
    const   input   =   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) . split ( "\n" ) ;

    const   res     =   {
        "list" :     input   ,   // The array of input lines
        "index" :   0       ,   // Current position in the list
        "max" :     input . length  ,   // Total number of items in the list


        // Checks if there are more elements to read.
        "hasNext" :     function ( )    {
                                return  this . index    <   this . max
                        }   ,


        // Returns the next element from the list, or throws an error if no more elements.
        "next" :        function ( )    {
                                        if  ( ! this . hasNext ( ) )    {
                                                throw   "ArrayIndexOutOfBoundsException" ;
                                        }   else    {
                                                return  this . list [ this . index ++ ] ;
                                        }
                                }
    }   ;   // End of 'res' object definition.


    return  res ;

} ; // End of 'create' function definition.



// Initialize the input reader object.
const   o   =   create ( )  ;


// Helper function to get the next raw string from input.
const   next    =   ( ) =>  o . next ( )    ;


// Helper function to get the next integer from input.
const   nextInt =   ( ) =>  parseInt ( o . next ( ) )    ;


// Helper function to get the next line as an array of strings, split by space.
const   nextStrArray    =   ( ) =>  o . next ( ) . split ( " " )    ;


// Helper function to get the next line as an array of integers, split by space.
const   nextIntArray    =   ( ) =>  o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) )    ;


// Helper function to get the next line as an array of characters.
const   nextCharArray   =   ( ) =>  o . next ( ) . split ( "" )    ;


// Helper function to check if there's more input.
const   hasNext =   ( ) =>  o . hasNext ( ) ;


// Custom console output function.
const   myout   =   ( ... x ) =>    console . log ( ... x ) ;


// The main logic of the program.
const   Main    =   ( ) =>  {

    // Read two integers, n and m, from the input.
    const   [ n ,   m ]     =   nextIntArray ( )    ;


    // Calculate the answer based on the given condition.
    // Note: The original code uses 'M' which is not defined, preserving this exact identifier.
    let     ans     =   m   <=  2   *   n   ?   Math . floor ( M   /   2 )   :   Math . floor ( ( 2   *   n   +   m )   /   4 )   ;


    // Output the calculated answer.
    console . log ( ans )   ;

}   ; // End of 'Main' function.


// Execute the main program.
Main ( )    ;