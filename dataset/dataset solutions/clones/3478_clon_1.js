/* This section handles input/output setup and execution timing.
 * It's generally boilerplate for competitive programming. */
var    read    =    require('readline').createInterface(    {
    input  :  process.stdin,
    output :  process.stdout
}    )   ;

var   obj   ;
var   inLine =   [   ]   ;

read.on   ( 'line' ,   function(input) {
    inLine.push(input) ;
} )  ;

read.on   ( 'close' ,   function ( )   {

    obj = init( inLine )    ;

    console.error ( "\n" )   ;

    var start = Date.now()   ;

    Main ( )   ;

    var end = Date.now() - start   ;

    myerr ( "time : " + ( end ) + "ms" )   ;

    myerr ( "memory : " + Math.round ( process.memoryUsage ( ) . heapTotal / 1024 ) + "KB" )   ;
} )   ;

// Utility function to create a deep copy of an object.
function   makeClone ( obj )   {
    return   JSON.parse ( JSON.stringify ( obj ) )   ;
}

// Input parsing helper functions.
function   nextInt ( )   {
    return   myconv ( next ( ) ,   1 )   ;
}
function   nextStrArray ( )   {
    return   myconv ( next ( ) ,   2 )   ;
}
function   nextIntArray ( )   {
    return   myconv ( next ( ) ,   4 )   ;
}
function   nextCharArray ( )   {
    return   myconv ( next ( ) ,   6 )   ;
}

function   next ( )   {
    return   obj.next ( )   ;
}
function   hasNext ( )   {
    return   obj.hasNext ( )   ;
}

/* Initializes the input object with a list of lines. */
function   init ( input )   {
    return   {
        list   :   input   ,
        index  :   0       ,
        max    :   input.length   ,

        hasNext :   function ( )   {
            return   (   this.index   <   this.max   )   ;
        }   ,

        next :   function ( )   {
            if   (   this.hasNext ( )   )   {
                return   this.list [ this.index++ ]   ;
            } else   {
                throw   "ArrayIndexOutOfBoundsException ‚There is no more input"   ;
            }
        }
    }   ;
}

// Standard output function.
function   myout ( s )   {
    console.log ( s )   ;
}

// Debug error output function.
function   myerr ( s )   {
    console.error ( "debug:"   +   require ( "util" ) . inspect ( s ,   false ,   null ) )   ;
}

/**
 *  Converts input based on the 'no' parameter.
 *  @param {any} i - The input to convert.
 *  @param {number} no - Conversion type:
 *     - 1: Parse integer.
 *     - 2: Split by space.
 *     - 4: Split by space and map to Number.
 *     - 6: Split by character.
 *     - 7: Split by character and map to Number.
 *     - 8: Join by space.
 *     - 9: Join by newline.
 *     - 0: Join with no character.
 *     - Default: Return as is.
 */
function   myconv ( i ,   no )   {
    try   {
        switch   ( no )   {
            case   1   :   return   parseInt ( i )   ;
            case   2   :   return   i.split ( " " )   ;
            case   4   :   return   i.split ( " " ) . map ( Number )   ;
            case   6   :   return   i.split ( "" )   ;
            case   7   :   return   i.split ( "" ) . map ( Number )   ;
            case   8   :   return   i.join ( " " )   ;
            case   9   :   return   i.join ( "\n" )   ;
            case   0   :   return   i.join ( "" )   ;
            default   :   return   i   ;
        }
    }   catch   ( e )   {
        return   i   ;
    }
}

/* End of boilerplate code. The main logic starts here. */

function   Main ( )   {
    var   N     =   nextInt ( )   ;
    var   check =   0   ;
    var   isOK  =   false   ;

    // Check for triangular number property.
    while   (   check   <=   N   )   {
        if   (   (   check   *   (   check   + 1 )   )   /   2   ==   N   )   {
            isOK   =   true   ;
            break   ;
        }
        check++   ;
    }

    if   (   !isOK   )   {
        myout ( "No" )   ;
        return   ;
    }

    myout ( "Yes" )   ;

    // Initialize a 2D array.
    var   list   =   new   Array ( check   +   1 )   ;

    for   (   var   i   = 0   ;   i   <   check   +   1   ;   i++   )   {
        list [ i ]   =   new   Array ( check )   ;
    }

    var   count   =   1   ;

    // Populate the array with numbers.
    for   (   var   i   = 0   ;   i   <   check   ;   i++   )   {
        for   (   var   j   = i   ;   j   <   check   ;   j++   )   {
            list [ i ] [ j ]   =   count   ;
            list [ j + 1 ] [ i ]   =   count   ;
            count++   ;
        }
    }

    myerr ( list )   ;
    myout ( list.length )   ;

    var   output   =   new   Array ( list.length )   ;

    // Prepend 'check' to each sub-array and format for output.
    for   (   var   i   = 0   ;   i   <   list.length   ;   i++   )   {
        list [ i ] . unshift ( check )   ;
        output [ i ]   =   list [ i ] . join ( " " )   ;
    }

    myout ( myconv ( output ,   9 ) )   ;
}