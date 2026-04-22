/*
 * This is the main function where the core logic resides.
 * It simulates a round-robin scheduling algorithm.
 */
function main  (  )   {
  // Declare variables required for the scheduling simulation.
  // nq will hold the number of processes and the quantum time.
  var   nq = input[0].split(' ').map(Number)
    , queue = [ ]   // The queue to hold processes awaiting execution.
    , process       // Variable to hold the current process being handled.
    , total         // Accumulator for total elapsed time.
    ;

  /*
   * Initialize the process queue from the input data.
   * Each process string is parsed into an array [name, time_remaining].
   */
  input.slice(1, nq[0] + 1).forEach( function (process) {
    process = process.split(' '); // Split process string into name and time.
    process[1] = Number(process[1]); // Convert time to a number.
    queue.push(process); // Add the processed item to the queue.
  } ) ;


  // Initialize total elapsed time to zero.
  total = 0 ;

  // Loop as long as there are processes in the queue.
  while (queue.length !== 0) {
    // Get the next process from the front of the queue.
    process = queue.shift();

    // Check if the process requires more time than the quantum.
    if (process[1] > nq[1]) {
      // Process still needs more time.
      process[1] -= nq[1]; // Deduct quantum from remaining time.
      total += nq[1]; // Add quantum to total elapsed time.
      queue.push(process); // Put the process back at the end of the queue.
    }
    else {
      // Process completes within or exactly at the quantum.
      total += process[1]; // Add remaining time to total elapsed time.
      // Log the completion of the process with its total turnaround time.
      console.log(process[0] + ' ' + total);
    }
  } // End of while loop.
} // End of main function definition.

// Global variable to store all input data.
var input = '' ; // Initialize as an empty string.

// Set up standard input stream listeners.
process.stdin.resume( ) ; // Keep the process alive for input.
process.stdin.setEncoding('utf8') ; // Specify UTF-8 encoding for input.

// Event listener for incoming data chunks.
process.stdin.on('data', function (chunk) {
  input += chunk ; // Append each chunk to the input string.
} ) ;

// Event listener for the end of the input stream.
process.stdin.on('end', function ( ) {
  input = input.split('\n') ; // Split the accumulated input by newlines.
  main( ) ; // Call the main function to start processing.
} ) ;