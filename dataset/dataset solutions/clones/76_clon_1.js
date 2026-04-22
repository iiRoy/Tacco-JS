/*
 * This JavaScript file demonstrates a solution for processing numerical input.
 * It reads a string of space-separated numbers, sorts them in descending order,
 * and then outputs the sorted sequence.
 *
 * This implementation supports reading from a specified file path (via command-line argument)
 * or from standard input if no argument is provided.
 */

let    fs    =    require ( 'fs' )   ;  //  Import the Node.js file system module for file operations.


/**
 *  Processes the input data by parsing numbers, sorting them, and printing the result.
 *
 *  @param {string} data - A string containing space-separated numbers.
 *                         Example: "10 5 20 1"
 */
const    yourAnswerFunctionComesHere    =    data    =>    {

    //  Step 1: Clean and parse the input string into an array of numbers.
    //  - `trim()` removes leading/trailing whitespace.
    //  - `split(" ")` divides the string into an array of substrings using space as a delimiter.
    //  - `map(Number)` converts each substring in the array to a numerical value.
    var    Arr    =    ( data . trim ( ) ) . split ( " " ) . map ( Number ) ;


    //  Step 2: Sort the array of numbers in descending order.
    //  The comparison function `(a, b) => b - a` ensures a descending sort.
    Arr . sort ( function ( a , b ) { return    b - a ; } ) ;


    //  Step 3: Join the sorted numbers back into a single string, separated by spaces,
    //          and then print this string to the console.
    console . log ( Arr . join ( " " ) ) ;

}


/**
 *  Reads the content of a specified file asynchronously.
 *  Upon successful reading, the data is passed to `yourAnswerFunctionComesHere`.
 *
 *  @param {string} path - The file path to read from.
 */
const    readFile    =    path    =>    {

    //  fs.readFile is an asynchronous function.
    //  It takes the file path, encoding, and a callback function.
    fs . readFile ( path ,    'utf8' ,    ( err ,    data )    =>    {

        //  In a production scenario, 'err' should be handled (e.g., console.error, throw).
        //  For this example, we assume no errors or ignore them.
        yourAnswerFunctionComesHere ( data ) ;

    } ) ;

}


/**
 *  Reads data synchronously from standard input (`/dev/stdin`).
 *  This is typically used in competitive programming environments on Linux-like systems.
 */
const    readFileWithoutArg    =    ( )    =>    {

    //  readFileSync is a synchronous function. It blocks execution until the file is read.
    const    data    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;

    //  Process the data obtained from standard input.
    yourAnswerFunctionComesHere ( data ) ;

}


let    sampleInputPath    =    ""    ; //  Declare a variable to store the input file path.


//  Determine the input source based on command-line arguments.
//  `process.argv` is an array containing command-line arguments.
//  `process.argv[0]` is 'node', `process.argv[1]` is the script file path.
//  So, if `length > 2`, it means a custom argument (the input path) was provided.
if ( process . argv . length    >    2 )    {

    //  If an argument exists, it's assumed to be the path to the input file.
    sampleInputPath    =    process . argv [ 2 ] ;
    readFile ( sampleInputPath ) ; //  Call the function to read from the specified file.

}    else    {

    //  If no command-line argument is provided, read from standard input.
    readFileWithoutArg ( ) ;

}