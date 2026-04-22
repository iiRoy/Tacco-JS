/*
 * This JavaScript file demonstrates a multi-process approach
 * for text processing using child processes.
 * It can be configured for Windows or Linux newline conventions.
 */

// Configuration object for input and newline characters.
// config = { input: 'tmp', newline: '\r\n' }; // Windows newline setup (commented out by default)
config = { input: '/dev/stdin', newline: '\n' }; // Linux/Unix newline setup, using standard input.


const workers = 1; // Defines the number of worker processes to spawn. Currently set to a single worker.


// console.log(process.argv); // Debugging line to inspect command-line arguments.


// Determine execution path: main process or child process.
if ( ! process . env . hasOwnProperty ( 'child' ) ) {
  // If 'child' environment variable is not set, execute the main logic.
  main ( );
}
else {
  // Otherwise, if 'child' is present, execute the child process logic.
  child ( );
}


/**
 * Main function responsible for orchestrating child processes.
 * Reads input, partitions it, spawns workers, and collects results.
 */
function main ( ) {

  var line , tlen , partition , worker , cmd , args , env , i , finished ; // Declare all local variables at the top.

  // Read the entire input file synchronously using Node.js 'fs' module.
  line = require ( 'fs' ) . readFileSync ( config . input , 'ascii' ) ;

  // Find the length of the first line (or total length if no newline).
  tlen = line . indexOf ( config . newline ) ;
  partition = [ 0 ] ; // Initialize partition array with the starting index.

  // Calculate partition points for distributing work among workers.
  for ( i = 1 ; i < workers ; i ++ ) {
    partition . push ( Math . floor ( tlen * i / workers ) ) ; // Add a partition point.
  }
  partition . push ( tlen ) ; // Add the end of the data as the last partition point.

  cmd = process . argv [ 0 ] ; // Get the Node.js executable path.
  args = process . argv . slice ( 1 ) ; // Get all arguments passed to the current script.

  worker = [ ] ; // Array to hold child process objects.
  res = [ ] ; // Array to accumulate results from child processes.

  // Loop to spawn each worker process.
  for ( i = 0 ; i < workers ; i ++ ) {
    // env = Object.assign({}, process.env); // Alternative way to copy environment, currently commented out.
    env = { } ; // Create a fresh environment object for the child.
    env [ 'child' ] = true ; // Mark this as a child process.
    env [ 'index' ] = i ; // Assign a unique index to each child.
    env [ 'start' ] = partition [ i ] ; // Define the start offset for the child's work.
    env [ 'end' ] = partition [ i + 1 ] ; // Define the end offset for the child's work.

    // Spawn a new child process.
    worker . push ( require ( 'child_process' ) . spawn ( cmd , args , {
      'env' : env , // Pass the custom environment variables.
      'stdio' : [ 'pipe' , 'pipe' , null ] // Configure stdio: stdin, stdout are pipes; stderr is null (inherits parent).
    } ) ) ;
    res . push ( '' ) ; // Initialize an empty string for each worker's result.
  }

  // Set up data listeners for each worker's standard output.
  for ( i in worker ) {
    worker [ i ] . stdout . setEncoding ( 'ascii' ) ; // Set encoding for stdout data.
    worker [ i ] . stdout . on ( 'data' ,
      ( function ( ) { // Immediately-invoked function expression to capture 'i' for closure.
        var idx = i ; // Capture the current index.
        return function ( chunk ) { // Return the actual data handler.
          res [ idx ] = res [ idx ] + chunk ; // Append received chunk to the corresponding worker's result.
        }
      } ) ( )
    ) ;
    worker [ i ] . stdout . resume ( ) ; // Start flowing stdout data.
  }

  finished = 0 ; // Counter for finished worker processes.

  // Set up 'exit' event listeners for each worker process.
  for ( i in worker ) {
    worker [ i ] . on ( 'exit' ,
      ( function ( ) { // IIFE to capture 'i' for closure.
        var idx = i ; // Capture the current index.
        return function ( ) { // Return the exit handler.
          var i ; // Re-declare 'i' for local scope within this function.
          // console.log("Exit: ", idx); // Debugging line for worker exit.
          finished ++ ; // Increment the count of finished workers.

          // If all workers have finished, process and display results.
          if ( finished === workers ) {
            for ( i in res ) { // Iterate through collected results.
              if ( res [ i ] . length !== 0 ) {
                console . log ( res [ i ] ) ; // Print non-empty results.
              }
            }
          }
        }
      } ) ( )
    ) ;
  }

  // Send the input line to each worker's standard input and then close stdin.
  for ( i in worker ) {
    worker [ i ] . stdin . write ( line , 'ascii' ) ; // Write the input data.
    worker [ i ] . stdin . end ( ) ; // Close the stdin stream, signaling EOF.
  }
}


/**
 * Child function executed by worker processes.
 * Reads its assigned portion of data from stdin, processes it, and writes results to stdout.
 */
function child ( ) {

  var str ; // Variable to accumulate input data from parent.
  str = '' ; // Initialize string as empty.

  process . stdin . setEncoding ( 'ascii' ) ; // Set encoding for stdin.
  process . stdin . on ( 'data' , function ( chunk ) { str = str + chunk ; } ) ; // Append incoming data chunks.
  process . stdin . on ( 'end' , child_main ) ; // Call child_main once all stdin data is received.
  process . stdin . resume ( ) ; // Start flowing stdin data.


  /**
   * Core logic for the child process after receiving all input.
   * Performs the actual data processing based on environment variables.
   */
  function child_main ( ) {
    var line , T , P , start , end , res , idx ; // Declare local variables.

    // Split the accumulated string into two lines based on the configured newline character.
    line = str . split ( config . newline , 2 ) ;
    T = line [ 0 ] ; // The first line (text to search in).
    P = line [ 1 ] ; // The second line (pattern to search for).

    start = process . env . start ; // Get the start offset from environment variables.
    end = process . env . end ; // Get the end offset from environment variables.
    res = [ ] ; // Array to store found indices.
    idx = start ; // Initialize search index with the start offset.

    // Perform pattern search within the assigned text segment.
    while ( ( idx = T . indexOf ( P , idx ) ) !== - 1 && idx < end ) {
      res . push ( idx ) ; // Add found index to results.
      idx ++ ; // Increment index to find next occurrence (important for overlapping patterns).
    }

    process . stdout . write ( res . join ( '\n' ) , 'ascii' ) ; // Write results to stdout, joined by newlines.
    // console.log(''); // Debugging line, commented out.
    process . stdout . end ( ) ; // Close stdout stream.
    process . exit ( ) ; // Terminate the child process.
  }
}