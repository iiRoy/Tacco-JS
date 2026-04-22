/*
 * This section contains utility functions for input/output processing.
 * You don't necessarily need to understand its internal workings for the main logic.
 * It handles reading input lines and preparing them for further processing.
 */
var    read    =   require('readline') .createInterface({

    input   :   process . stdin,
    output  :   process . stdout
});


var   obj;
var   inLine    =   []; // This array will store all input lines.


read.   on(   'line',
    function    (   input   )
    {
        inLine. push    (   input   );
    }
);


read.   on(
    'close',
    function    (   )
    {
        obj =   init(   inLine  );
        console.    error   (   '\n↑入力 ↓出力'  ); /* Debug message indicating input/output flow */
        Main();
    }
);


/*
 *  Utility function to create a deep clone of an object.
 *  Handles Set objects specifically by creating a new Set from its elements.
 *  For other objects, it uses JSON serialization/deserialization for deep cloning.
 */
function makeClone (   obj )   {
    return  (   obj instanceof  Set )
        ?   new Set (   Array.  from    (   obj )   )
        :   JSON.   parse   (   JSON.   stringify   (   obj )   );
}


function    nextInt (   )   {
    return  myconv  (   next(), 1   );
}


function    nextStrArray    (   )   {
    return  myconv  (   next(), 2   );
}


function    nextIntArray    (   )   {
    return  myconv  (   next(), 4   );
}


function    nextCharArray   (   )   {
    return  myconv  (   next(), 6   );
}


function    next    (   )   {
    return  obj.    next    ();
}


function    hasNext (   )   {
    return  obj.    hasNext ();
}


/**
 * Initializes an input object with methods for sequential access to input lines.
 * This object manages the list of input lines, current index, and provides
 * `hasNext` and `next` methods similar to an iterator.
 * @param {Array<string>} input - An array of input lines read from stdin.
 * @returns {object} An object with properties and methods for input traversal.
 */
function init(  input   )   {
    return  {
        list    :   input,
        index   :   0,
        max     :   input.  length,

        hasNext :   function    (   )   {
            return  (   this.   index   <   this.   max );
        },

        next    :   function    (   )   {
            if  (   this.   hasNext ()  )
            {
                return  this.   list    [   this.   index++ ];
            }
            else
            {
                throw   'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}


function    myout   (   s   )   {
    console.    log (   s   );
}


function    myerr   (   s   )   {
    console.    error   (   'debug:'    +   require('util').    inspect (   s,   false,  null    )   );
}


/*
 *  This function 'myconv' handles various data conversions based on the 'no' parameter.
 *  It's a versatile utility for parsing and formatting input/output.
 *
 *  Parameter 'no' mapping for conversion types:
 *  - (any other value / default) : returns 'i' (original input) without modification.
 *  - 1: Parses 'i' as an integer using parseInt().
 *  - 2: Splits string 'i' by spaces into an array of strings.
 *  - 4: Splits string 'i' by spaces and then maps each part to a Number.
 *  - 6: Splits string 'i' into an array of individual characters.
 *  - 7: Splits string 'i' into individual characters and then maps each to a Number.
 *  - 8: Joins array 'i' elements with spaces.
 *  - 9: Joins array 'i' elements with newline characters.
 *  - 0: Joins array 'i' elements with no separator (concatenates).
 */
function    myconv  (   i,  no  )   {
    try {
        switch  (   no  )   {
            case    1:
                return  parseInt(i);
            case    2:
                return  i.  split(' ');
            case    4:
                return  i.  split(' '). map(Number);
            case    6:
                return  i.  split('');
            case    7:
                return  i.  split(''). map(Number);
            case    8:
                return  i.  join(' ');
            case    9:
                return  i.  join('\n');
            case    0:
                return  i.  join('');
            default:
                return  i;
        }
    }   catch   (   e   )   {
        return  i; /* In case of conversion error, return original input */
    }
}

/*
 * End of utility functions. The main program logic starts below.
 * This part handles the core algorithm for rearranging the input list
 * based on the parity of N and the loop index i.
 */
function    Main    (   )   {
    var N       =   nextInt ();
    var list    =   nextIntArray    ();
    var output  =   [];

    for (   var i   =   0;  i   <   N;  i++ )   {
        // Check if N is even or odd to determine the rearrangement logic
        if  (   N   %   2   ==  0   )   {
            // If N is an even number
            if  (   i   %   2   ==  0   )   {
                output. push    (   list    [i] ); // Append to the end
            }   else    {
                output. unshift (   list    [i] ); // Prepend to the beginning
            }
        }   else    {
            // If N is an odd number
            if  (   i   %   2   ==  1   )   {
                output. push    (   list    [i] ); // Append to the end
            }   else    {
                output. unshift (   list    [i] ); // Prepend to the beginning
            }
        }
    }

    // Output the rearranged list, joined by spaces, to standard output
    myout   (   myconv  (   output, 8   )   );
}