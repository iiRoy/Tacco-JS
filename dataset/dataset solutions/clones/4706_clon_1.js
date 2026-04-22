/*
 *  This section handles standard input/output operations
 *  and initializes necessary modules for processing.
 */
var     read    =   require   ( 'readline' ) .   createInterface   (   {
        input   :   process.stdin,
        output  :   process.stdout
    }   )   ;


var     obj     ;
var     inLine  =   [   ]   ;


// Event listener for each line of input from the console.
read.on (   'line'  ,   function    (   input   )   {
        inLine.push   (   input   )   ;
    }   )   ;


// Event listener when the input stream is closed.
read.on (   'close' ,   function    (   )   {
        // Initialize the global input object 'obj' with all collected lines.
        obj     =   init    (   inLine  )   ;

        // Display a separator message to distinguish input from output in console.error.
        console.error   (   '\n↑入力 ↓出力'   )   ;

        // Execute the main program logic.
        Main    (   )   ;
    }   )   ;


/*
 *  Utility function to create a deep copy of an object.
 *  Specifically handles 'Set' objects, otherwise uses JSON serialization/deserialization.
 *  @param {any} obj - The object to be cloned.
 *  @returns {any} A deep clone of the input object.
 */
function    makeClone   (   obj )
{
    return  (   obj instanceof  Set   )
        ?   new Set (   Array.from  (   obj )   )
        :   JSON.parse  (   JSON.stringify  (   obj )   )   ;
}


// --- Input Reading Helper Functions ---

/**
 *  Reads the next available input token and converts it to an integer.
 *  @returns {number} The next integer from input.
 */
function    nextInt (   )   {
    return  myconv  (   next    (   )   ,   1   )   ;
}


/**
 *  Reads the next available input token and splits it into an array of strings by space.
 *  @returns {Array<string>} An array of strings.
 */
function    nextStrArray    (   )   {
    return  myconv  (   next    (   )   ,   2   )   ;
}


/**
 *  Reads the next available input token, splits it by space, and converts parts to numbers.
 *  @returns {Array<number>} An array of numbers.
 */
function    nextIntArray    (   )   {
    return  myconv  (   next    (   )   ,   4   )   ;
}


/**
 *  Reads the next available input token and splits it into an array of characters.
 *  @returns {Array<string>} An array of single-character strings.
 */
function    nextCharArray   (   )   {
    return  myconv  (   next    (   )   ,   6   )   ;
}


/**
 *  Retrieves the next input token from the initialized input object.
 *  @returns {string} The next input token.
 */
function    next    (   )   {
    return  obj.next    (   )   ;
}


/**
 *  Checks if there are more input tokens available.
 *  @returns {boolean} True if more input is available, false otherwise.
 */
function    hasNext (   )   {
    return  obj.hasNext (   )   ;
}


/**
 *  Initializes an object for sequential input reading.
 *  This object provides methods to check for available input and retrieve the next line.
 *  @param {Array<string>} input - An array of strings representing all input lines.
 *  @returns {object} An input reader object.
 */
function    init    (   input   )   {
    return  {
        list    :   input,
        index   :   0,
        max     :   input.length,

        hasNext :   function    (   )   {
            // Checks if the current index is within the bounds of the input list.
            return  (   this.index  <   this.max    )   ;
        },

        next    :   function    (   )   {
            // Retrieves the next input line if available.
            if  (   this.hasNext    (   )   )
            {
                return  this.list   [   this.index++    ]   ;
            }
            else
            {
                // Throws an error if no more input is available.
                throw   'ArrayIndexOutOfBoundsException ‚There is no more input'   ;
            }
        }
    }   ;
}


// --- Output Helper Functions ---

/**
 *  Outputs a string to the standard console.log.
 *  @param {string} s - The string to output.
 */
function    myout   (   s   )   {
    console.log (   s   )   ;
}


/**
 *  Outputs a debug message to console.error, including detailed inspection of the object.
 *  @param {any} s - The object to debug output.
 */
function    myerr   (   s   )   {
    console.error   (   'debug:'    +   require (   'util'  )   .   inspect (   s   ,   false   ,   null    )   )   ;
}


/*
 *  A flexible conversion function for input processing.
 *  The 'no' parameter specifies the type of conversion to perform.
 *
 *  -   1:  Parses the input string as an integer.
 *  -   2:  Splits the input string by spaces into an array of strings.
 *  -   4:  Splits the input string by spaces and converts each part to a number.
 *  -   6:  Splits the input string into an array of individual characters.
 *  -   7:  Splits the input string into characters and converts each to a number.
 *  -   8:  Joins elements of an array with spaces.
 *  -   9:  Joins elements of an array with newline characters.
 *  -   0:  Joins elements of an array without any separator.
 *  -   Default: Returns the input as is.
 */
function    myconv  (   i   ,   no  )   {
    try
    {
        switch  (   no  )
        {
            case    1   :
                return  parseInt    (   i   )   ;
            case    2   :
                return  i.split (   ' ' )   ;
            case    4   :
                return  i.split (   ' ' )   .   map (   Number  )   ;
            case    6   :
                return  i.split (   ''  )   ;
            case    7   :
                return  i.split (   ''  )   .   map (   Number  )   ;
            case    8   :
                return  i.join  (   ' ' )   ;
            case    9   :
                return  i.join  (   '\n'    )   ;
            case    0   :
                return  i.join  (   ''  )   ;
            default :
                return  i   ;
        }
    }
    catch   (   e   )
    {
        // If any error occurs during conversion, return the original input.
        return  i   ;
    }
}


/*
 *  The primary function containing the core logic of the program.
 *  This function is invoked after all input has been read and initialized.
 */
function    Main    (   )   {
    var     N       =   nextInt (   )   ;           // Read an integer N
    var     L       =   "S" ;                       // Initialize character L to "S"
    var     list    =   nextCharArray   (   )   ;   // Read a character array 'list'
    var     check   =   [   "S" ,   "S" ]   ;       // Initialize 'check' array with two "S"s

    // Iterate from the second element up to (but not including) N
    for (   var     i   =   1   ;   i   <   N   ;   i++ )
    {
        // Check the character at the current index 'i' in 'list'
        if  (   list    [   i   ]   ==  "o" )
        {
            // Nested conditional logic based on 'check[i]' and 'check[i-1]'
            if  (   check   [   i   ]   ==  "S" )
            {
                check.push  (   check   [   i   -   1   ]   )   ;
            }
            else
            {
                if  (   check   [   i   -   1   ]   ==  "S" )
                {
                    check.push  (   "W" )   ;
                }
                else
                {
                    check.push  (   "S" )   ;
                }
            }
        }
        else    // If list[i] is not "o"
        {
            // Another set of nested conditional logic
            if  (   check   [   i   ]   ==  "S" )
            {
                if  (   check   [   i   -   1   ]   ==  "S" )
                {
                    check.push  (   "W" )   ;
                }
                else
                {
                    check.push  (   "S" )   ;
                }
            }
            else
            {
                check.push  (   check   [   i   -   1   ]   )   ;
            }
        }
    }

    // Output the joined 'check' array to error stream for debugging
    myerr   (   check.join  (   ""  )   )   ;

    // Final conditional check based on the 'N'-th element of 'check'
    if  (   check   [   N   ]   ==  L   )
    {
        // Remove the last element from the 'check' array
        check.pop   (   )   ;
        // Output the final joined string to standard output
        myout   (   check.join  (   ""  )   )   ;
    }
    else
    {
        // If the condition is not met, output -1
        myout   (   -1  )   ;
    }
}