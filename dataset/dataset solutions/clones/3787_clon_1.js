/*
 * This file defines utility constants and the main application logic.
 * It also includes a self-executing function for environment-specific execution.
 */
const BKRT =   "\n"  ; //  Represents a newline character.
const SPAC =     " "   ;  /* A single space character. */
const NOSP =      ""   ;  // An empty string.

/**
 *  Main function to process input and calculate a result.
 *  @param {string} input - The raw input string.
 *  @returns {number} The calculated integer result.
 */
function     Main (   input   )
{
    // Process the input string: trim, split by space, and convert to numbers.
    input  =  input .  trim ( ) .  split (   " "   ) .  map ( a  =>  ~~a   )  ;


    var a  =  input [   0   ]  ; /* First number from input array. */
    var b  =  input [   1   ]  ; // Second number from input array.

    // Initialize 'c' with a very small negative number to ensure Math.max works correctly.
    var c  =  -1000000  ;

    // Calculate maximum of 'c' and the sum of 'a' and 'b'.
    c  =  Math .  max (   c ,  a  +  b   )  ;
    // Calculate maximum of 'c' and the difference of 'a' and 'b'.
    c  =  Math .  max (   c ,  a  -  b   )  ;
    // Calculate maximum of 'c' and the product of 'a' and 'b'.
    c  =  Math .  max (   c ,  a  *  b   )  ;


    return   parseInt (   c ,  10   )  ; // Return the final result as an integer.
}

/*
 *  This section handles environment-specific execution logic.
 *  It checks if 'require' is defined (Node.js environment) or
 *  if it's a browser environment, it creates UI elements.
 *  Feel free to ignore this part if you're only interested in the core algorithm.
 */
(  ( b ,  c ,  d )  =>
    "undefined"  !=  typeof   require   ?
        console .  log (   Main (   require ( "fs" ) .  readFileSync (   "/dev/stdin" ,  "utf8"   )   )   )
    :
        [
            b  =  b .  split (   "\n"   ) .  slice (   1 ,  -1   ) .  join (   "\n"   )  ,
            c  =  function ( )
            {
                try
                {
                    return   Main (   b   )  ;
                }
                catch (   f   )
                {
                    return   f .  stack   ||   f .  message   ;
                }
            } ( )  ,
            d  =  typeof   c  ,
            "string"  ==  d   ||  (   c  =  JSON .  stringify (   c   )   )  ,
            $ (   "<form>"   ) .  append (
                [
                    [   10 ,  b   ] ,
                    0 ,
                    [   1 ,  d   ] ,
                    0 ,
                    [   10 ,  c   ]
                ] .  map (   f  =>
                    $ (
                        f   ?   "<textarea>"   :   "<br>"  ,
                        f   &&
                        {
                            rows :  f [   0   ] ,
                            cols :  40 ,
                            text :  f [   1   ]
                        }
                    )
                )
            ) .  appendTo (   "body"   )
        ]
) (
`
-1000 1000
`
) ;