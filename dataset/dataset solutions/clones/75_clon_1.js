let   fs    =    require ( 'fs' ) ; // Importing the Node.js File System module.


/*
 * This function processes raw input data.
 * It takes a string, splits it, sorts the parts numerically in descending order,
 * and then prints the result to the console.
 *
 * @param {string} data The input string to be processed.
 */
const    yourAnswerFunctionComesHere    =     data     =>     {
  // Step 1: Split the incoming data string by spaces.
  let    splitedData    =    data . split ( " " ) ;


  // Step 2: Sort the array of strings numerically in descending order.
  // The comparison function (y - x) ensures numbers are treated as such and sorted downwards.
  let    sortedData    =    splitedData . sort ( ( x , y )    =>    y   -   x ) ;


  // Step 3: Join the sorted elements back into a single string with spaces and log it.
  console . log ( sortedData . join ( " " ) ) ;
}


/*
 * This asynchronous function reads content from a file specified by a path.
 * Upon successful read, it passes the file content to 'yourAnswerFunctionComesHere'.
 *
 * @param {string} path The file path from which to read data.
 */
const    readFile    =     path     =>     {
  // Initiate asynchronous file reading. 'utf8' specifies the encoding.
  fs . readFile ( path ,    'utf8' ,    ( err ,    data )    =>     {
    // A simple comment inside the callback function.
    // Error handling is implicitly skipped in this example for brevity (as in original).
    yourAnswerFunctionComesHere ( data ) ;
  } ) ;
}


// This function reads data synchronously from standard input ('/dev/stdin').
// This is common in environments like competitive programming platforms.
const    readFileWithoutArg    =     ( )     =>     {
  // Synchronously read the entire content of standard input.
  const    data    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;

  // Process the data obtained from standard input.
  yourAnswerFunctionComesHere ( data ) ;
}


// Variable to hold the input file path, if provided via command-line arguments.
let    sampleInputPath    =    "" ; // Initialized to an empty string.


// Main execution block: Determine whether to read from a file or standard input.
if    ( process . argv . length    >    2 )     {
  // If command-line arguments are present (beyond script name), use the third argument as path.
  sampleInputPath    =    process . argv [ 2 ] ;
  readFile ( sampleInputPath ) ; // Call the function to read from the specified file.
}
else    {
  // Otherwise, if no specific file path is provided, read from standard input.
  readFileWithoutArg ( ) ; // Call the function to read from /dev/stdin.
}

// End of script.
// This example demonstrates a common pattern for handling input in Node.js scripts.