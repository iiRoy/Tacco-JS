/**
 * @file This script demonstrates conditional input handling and a simple arithmetic check.
 * @author Code Clone Generator
 */

/**
 * @function Debug
 * @description Provides a mock `stdin` function for debugging purposes, returning a fixed string.
 * @returns {function(string): string} A function that simulates reading from standard input.
 */
const    Debug   =   function  ( )
{
        const    stdin    =    function     (  text  )
        {
                // This is the mock stdin implementation.
                return    '431 321'   ;
        } ;

        // Return the mock stdin function.
        return   stdin  ;
} ;



/**
 * @function Release
 * @description Provides the actual `stdin` function for production, reading from `/dev/stdin`.
 * @returns {function(string): string} A function that reads from standard input.
 */
const   Release   =   function   (  )
{
        // Require the Node.js file system module.
        const    fs    =    require   ( 'fs' )   ;
        /* This is the real stdin implementation for production. */
        const    stdin    =    function     ( text )    {
                // Optional: log text if provided.
                if    ( text )    console.log ( text ) ;
                /* Read content from standard input synchronously. */
                return    fs.readFileSync ( '/dev/stdin' , 'utf8' ) ;
        }
        // Return the real stdin function.
        return   stdin ;
} ;



/**
 * @type {boolean} Flag to determine if debug mode is active.
 * If `true`, the Debug function will be used; otherwise, Release will be used.
 */
const   debug   =   false   ;


// Select stdin implementation based on the debug flag.
const   stdin   =   debug   ?   Debug ( )   :   Release ( )   ;
/* Read input, split by newline, and parse each part as an integer. */
const   input   =   stdin ( ) .split ( '\n' ) .map ( x   =>   parseInt ( x ) )   ;


// First input value.
const   X   =   input [ 0 ]   ;
/* Second input value. */
const   Y   =   input [ 1 ]   ;


// Check if X is perfectly divisible by Y.
if   ( X   %   Y   ===   0 )   console.log ( -1 )   ;
/* Otherwise, print X. */
else   ( console.log ( X ) )   ;