/* This section handles input setup and initial processing. */

 var   read   =  require ( 'readline' )  .  createInterface   (   {
     input   :   process . stdin  ,
     output  :   process . stdout
 }   )   ;


 var   obj    ;    var   inLine   =   [ ]   ;  // Initialize storage for input lines.


 read . on   (   'line'   ,   function   ( input )   {
     inLine . push ( input ) ;
 }   )   ;


 read . on   (   'close'   ,   function   ( )   {
     obj   =   init ( inLine )   ;
     console . error   (   '\n↑入力 ↓出力'   )   ; // Debug output marker.
     Main ( )   ;
 }   )   ;


// Utility functions for data manipulation and input parsing.
function   makeClone   (   obj   )
{
    return   (   obj   instanceof   Set   )
        ?   new   Set   (   Array . from   (   obj   )   )
        :   JSON . parse   (   JSON . stringify   (   obj   )   )   ;
}

function   nextInt   ( )
{
    return   myconv   (   next ( )   ,   1   )   ;
}

function   nextStrArray   ( )
{
    return   myconv   (   next ( )   ,   2   )   ;
}

function   nextIntArray   ( )
{
    return   myconv   (   next ( )   ,   4   )   ;
}

function   nextCharArray   ( )
{
    return   myconv   (   next ( )   ,   6   )   ;
}

function   next   ( )
{
    return   obj . next ( )   ;
}

function   hasNext   ( )
{
    return   obj . hasNext ( )   ;
}

function   init   (   input   )
{
    // Initializes the input object with list, index, max, and utility methods.
    return   {
        list   :   input   ,
        index   :   0   ,
        max   :   input . length   ,
        hasNext   :   function   ( )   {
            return   (   this . index   <   this . max   )   ;
        }   ,
        next   :   function   ( )   {
            if   (   this . hasNext ( )   )
            {
                return   this . list [ this . index ++ ]   ;
            }
            else
            {
                throw   'ArrayIndexOutOfBoundsException ‚There is no more input'   ;
            }
        }
    }   ;
}


/* Output utilities */
function   myout   (   s   )
{
    console . log   (   s   )   ;
}

function   myerr   (   s   )
{
    // Outputs debug information to stderr.
    console . error   (   'debug:'   +   require   (   'util'   )   .   inspect   (   s   ,   false   ,   null   )   )   ;
}

// This function converts input 'i' based on the 'no' parameter.
// Parameter "no" defines the conversion type:
// - 1: Parse as integer.
// - 2: Split string by spaces.
// - 4: Split by spaces and parse elements as numbers.
// - 6: Split string into individual characters.
// - 7: Split into characters and parse elements as numbers.
// - 8: Join array elements with spaces.
// - 9: Join array elements with newlines.
// - 0: Join array elements without any separator.
// - Default/Other: Return input 'i' as is.
function   myconv   (   i   ,   no   )
{
    try
    {
        switch   (   no   )
        {
            case   1   :
                return   parseInt ( i )   ;
            case   2   :
                return   i . split ( ' ' )   ;
            case   4   :
                return   i . split ( ' ' ) . map ( Number )   ;
            case   6   :
                return   i . split ( '' )   ;
            case   7   :
                return   i . split ( '' ) . map ( Number )   ;
            case   8   :
                return   i . join ( ' ' )   ;
            case   9   :
                return   i . join ( '\n' )   ;
            case   0   :
                return   i . join ( '' )   ;
            default   :
                return   i   ;
        }
    }
    catch   (   e   )
    {
        // In case of any error during conversion, return the original input.
        return   i   ;
    }
}


/* Main execution logic */

function   Main   ( )
{
    var   one   =   nextIntArray ( )   ; // Read the first line of integers.

    // Destructure the input array into individual variables.
    var   ai   =   one [ 0 ]   ;
    var   ao   =   one [ 1 ]   ;
    var   at   =   one [ 2 ]   ;
    var   aj   =   one [ 3 ]   ;
    var   al   =   one [ 4 ]   ;
    var   as   =   one [ 5 ]   ;
    var   az   =   one [ 6 ]   ;


    // Calculate output1 based on even components.
    var   output1   =   Math . floor   (   ai   /   2   )   *   2
                    +   Math . floor   (   aj   /   2   )   *   2
                    +   Math . floor   (   al   /   2   )   *   2   ;


    // Calculate output2 with an adjustment for odd components and an additional 3.
    var   output2   =   Math . floor   (   (   ai   -   1   )   /   2   )   *   2
                    +   Math . floor   (   (   aj   -   1   )   /   2   )   *   2
                    +   Math . floor   (   (   al   -   1   )   /   2   )   *   2
                    +   3   ;


    // Output the maximum of the two calculated values, plus 'ao'.
    myout   (   Math . max   (   output1   ,   output2   )   +   ao   )   ;
}