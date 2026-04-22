// Begin program execution.
// This section handles standard input setup.


process.stdin.resume();  // Activates the standard input stream to receive data.

// Sets the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


/*
 *  Declare a variable to accumulate all incoming data from stdin.
 *  It's initialized as an empty string.
 */
var input_string = '';


// Set up an event listener for 'data' events on the standard input.

process.stdin.on('data', function(chunk) {
    // When data arrives, append it to our input_string.
    input_string += chunk;
}); // End of 'data' event handler


/*
 *  This is the main logic block.
 *  It executes once all input has been received (i.e., stdin 'end' event).
 */
process.stdin.on('end', function() {
 // Split the entire input string into an array of lines using the newline character.
    const lines = input_string.split("\n");

  // Parse the first line as an integer, representing 'n'.
  // 'n' is likely the size of an array or a loop limit.
  const n = parseInt(lines[0]);

    // Split the second line into an array of strings using space as a delimiter.
    const ks = lines[1].split(" ");

  // Declare an empty array 'k' which will store parsed integers.
    const k = [];

  // Loop 'n' times to populate the 'k' array with integer values.
  for(var i=0; i<n; i++){
    k[i] = parseInt(ks[i]); // Convert each string element to an integer.
  } // End of population loop for 'k' array.


  // Initialize a counter 't' to zero. This likely tracks operations or iterations.
  var t = 0;

  // Initialize a boolean flag 'changed' to true to enter the while loop.
  var changed = true;

  // Main processing loop: continues as long as a change occurs within an iteration.
  while(changed){
    // Reset the 'changed' flag at the beginning of each outer loop iteration.
    changed = false;

    // Iterate through the 'k' array from the beginning to the end.
    for(var i=0;i<n;i++){
      // Check if the current element k[i] is positive.
      if(k[i]>0){
        // Inner loop: iterate from i+1 to the end of the array.
        // This loop continues as long as k[i] is less than or equal to k[j].
        for(var j=i+1;j<n&&k[i]<=k[j];j++){
          // Decrement k[j] if the condition holds.
          k[j]--;
        } // End of inner loop.

        // Decrement the current element k[i].
        k[i]--;

        // Increment the operation counter 't'.
        t++;

        // A change has occurred, so set the flag to true to continue the outer loop.
        changed = true;
      } // End of if(k[i]>0) block.
    } // End of outer for loop.
  } // End of while(changed) loop.

  // After the main processing loop finishes, print the final value of 't' to console.
  console.log(t);
}); // End of 'end' event handler function.


// End of JavaScript program.