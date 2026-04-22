/*
 * This section of code is part of a utility library for competitive programming.
 * It handles input/output operations and provides helper functions for data manipulation.
 * Do not modify this utility section unless absolutely necessary for cloning purposes.
 */
var    read    =    require('readline') . createInterface ( {

    input    :    process . stdin,
    output   :    process . stdout

} ) ;

// Global variable to store the processed input object
var    obj    ;

// Array to accumulate all input lines from stdin
var    inLine    =    [ ]    ;


// Event listener for each line of input
read . on ( 'line' ,    function    (    input    )    {

    inLine . push (    input    )    ;

} ) ;


// Event listener for the 'close' event, indicating end of input
read . on ( 'close' ,    function    (    )    {

    // Initialize the input object once all lines are read
    obj    =    init (    inLine    )    ;

    // Output a newline to stderr for visual separation (e.g., from debugger output)
    console . error (    "\n"    )    ;

    // Record the start time for performance measurement
    var    start    =    new    Date (    )    ;

    // Call the main application logic
    Main (    )    ;

    // Calculate the elapsed time
    var    end    =    new    Date (    )    -    start    ;

    // Report execution time to stderr
    myerr (    "time : "    +    (    end    )    +    "ms"    )    ;

    // Report memory usage to stderr
    myerr (    "memory : "    +    Math . round (    process . memoryUsage (    ) . heapTotal    /    1024    )    +    "KB"    )    ;

} ) ;


/**
 * Creates a deep clone of a given object using JSON serialization/deserialization.
 * Note: This method has limitations (e.g., cannot clone functions, Date objects, etc.).
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep copy of the input object.
 */
function    makeClone    (    obj    )    {

    return    JSON . parse (    JSON . stringify (    obj    )    )    ;

}


/**
 * Reads the next input token and converts it to an integer.
 * @returns {number} The next input token as an integer.
 */
function    nextInt    (    )    {    return    myconv (    next (    )    ,    1    )    ;    }


/**
 * Reads the next input token and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
function    nextStrArray    (    )    {    return    myconv (    next (    )    ,    2    )    ;    }


/**
 * Reads the next input token, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function    nextIntArray    (    )    {    return    myconv (    next (    )    ,    4    )    ;    }


/**
 * Reads the next input token and splits it into an array of characters.
 * @returns {string[]} An array of characters.
 */
function    nextCharArray    (    )    {    return    myconv (    next (    )    ,    6    )    ;    }


/**
 * Retrieves the next available input line/token.
 * @returns {string} The next input line/token.
 */
function    next    (    )    {    return    obj . next (    )    ;    }


/**
 * Checks if there are more input lines/tokens available.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function    hasNext    (    )    {    return    obj . hasNext (    )    ;    }


/**
 * Initializes an input object with methods for sequential access.
 * This object manages the input lines and their current index.
 * @param {string[]} input - An array of strings representing all input lines.
 * @returns {object} An object with `hasNext` and `next` methods.
 */
function    init    (    input    )    {

    var    returnObj    =    {

        list    :    input    ,
        index   :    0    ,
        max     :    input . length    ,

        /**
         * Checks if there are more elements to read in the input list.
         * @returns {boolean} True if there are more elements, false otherwise.
         */
        hasNext    :    function    (    )    {
            return    (    this . index    <    this . max    )    ;
        }    ,

        /**
         * Retrieves the next element from the input list and advances the index.
         * Throws an error if no more elements are available.
         * @returns {string} The next input element.
         * @throws {string} "ArrayIndexOutOfBoundsException" if no more elements.
         */
        next    :    function    (    )    {

            if    (    ! this . hasNext (    )    )    {

                throw    "ArrayIndexOutOfBoundsException これ以上ないよ"    ;

            }    else    {

                var    returnInput    =    this . list    [    this . index    ]    ;
                this . index ++    ;
                return    returnInput    ;

            }
        }
    }    ;

    return    returnObj    ;

}


/**
 * Outputs a string to the standard output (console.log).
 * @param {string} s - The string to be outputted.
 */
function    myout    (    s    )    {

    console . log (    s    )    ;

}


/**
 * Outputs a debug message to the standard error (console.error).
 * Uses Node.js 'util.inspect' for detailed object inspection.
 * @param {*} s - The value to be debug-printed.
 */
function    myerr    (    s    )    {

    console . error (    "debug:"    +    require (    "util"    ) . inspect (    s    ,    false    ,    null    )    )    ;

}


/*
 * Helper function for various data conversions based on a 'no' parameter.
 * This function handles different types of input processing:
 *  - 1: Convert to integer.
 *  - 2: Split string by space into an array of strings.
 *  - 4: Split string by space and convert elements to numbers (array of numbers).
 *  - 6: Split string by character into an array of characters.
 *  - 7: Split string by character and convert elements to numbers (array of numbers).
 *  - 8: Join array elements with spaces.
 *  - 9: Join array elements with newlines.
 *  - 0: Join array elements without any separator.
 *  - Default: Return input as is.
 *  - Error: Return input as is.
 */
function    myconv    (    i    ,    no    )    {

    try    {

        switch    (    no    )    {

            case    1    :
                return    parseInt (    i    )    ;

            case    2    :
                return    i . split (    " "    )    ;

            case    4    :
                return    i . split (    " "    ) . map (    Number    )    ;

            case    6    :
                return    i . split (    ""    )    ;

            case    7    :
                return    i . split (    ""    ) . map (    Number    )    ;

            case    8    :
                return    i . join (    " "    )    ;

            case    9    :
                return    i . join (    "\n"    )    ;

            case    0    :
                return    i . join (    ""    )    ;

            default    :
                return    i    ;
        }

    }    catch    (    e    )    {

        // In case of any conversion error, return the original input
        return    i    ;

    }
}


/*
 * This marks the end of the utility section.
 * The application-specific logic follows below.
 */
function    Main    (    )    {

    // Read the first line of input as an array of integers
    var    one    =    nextIntArray (    )    ;

    // Extract the value for N from the first element of 'one'
    var    N    =    one    [    0    ]    ;

    // Extract the value for A from the second element of 'one'
    var    A    =    one    [    1    ]    ;

    // Extract the value for B from the third element of 'one'
    var    B    =    one    [    2    ]    ;

    // Calculate the minimum of B and N * A, then output the result
    myout (    Math . min (    B    ,    N    *    A    )    )    ;

}