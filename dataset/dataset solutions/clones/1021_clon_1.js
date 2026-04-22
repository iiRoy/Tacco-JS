// Initialize a variable to store all incoming data from the standard input stream.
let content = '';

// Resume the standard input stream to begin receiving data.
process
  .stdin
  .resume();

// Set the encoding for the standard input stream to UTF-8.
process
  .stdin
  .setEncoding(
    'utf8'
  );

// Attach an event listener for 'data' events on the standard input.
// This callback function appends each received buffer chunk to the 'content' string.
process
  .stdin
  .on(
    'data',
    buf => {
      // Append the received buffer (data chunk) to our content accumulator.
      content += buf;
    }
  ); // End of 'data' event listener.


// Attach an event listener for the 'end' event on the standard input.
// This callback will execute once all input data has been received.
process
  .stdin
  .on(
    'end',
    () => {
      // Process the accumulated content from stdin.
      // First, remove any leading or trailing whitespace from the content.
      // Then, split the content string into an array of lines based on the newline character.
      // Finally, map each line to a processed array format.
      const [
              [
                // The first element of the first line (usually a throwaway value, like 'N' for number of tasks) is ignored.
                ,
                quantum // The second element of the first line is extracted as 'quantum'.
              ],
              ...tasks // The rest of the lines are collected into the 'tasks' array.
            ] = content
                  .trim() // Remove whitespace from both ends of the string.
                  .split( '\n' ) // Split the string into an array of lines.
                  .map(
                    line => {
                      // For each line, split it by a space to separate the name and time.
                      const [
                              name, // The first part of the line is the task name.
                              time  // The second part is the task's processing time.
                            ] = line.split( ' ' );
                      // Convert the time string to a number using the unary plus operator.
                      // Return an array containing the task's name and its numerical time.
                      return [
                               name,
                               +time
                             ];
                    }
                  );
      
      // Initialize a variable to keep track of the current elapsed time in the round-robin schedule.
      let cur = 0;

      // Continue processing tasks as long as there are tasks remaining in the queue.
      while ( tasks.length > 0 ) {
        // Remove the first task from the front of the 'tasks' array for processing.
        const task = tasks.shift();
        
        // Determine the actual time this task will run in the current quantum.
        // It's the minimum of the task's remaining time and the global quantum value.
        const time = Math.min( task[1], quantum );
        
        // Add the time this task ran to the total elapsed time.
        cur += time;
        
        // Decrease the remaining time for the current task.
        task[1] -= time;

        // Check if the task still has processing time left after this quantum.
        if ( task[1] > 0 ) {
          // If the task is not yet complete, push it to the end of the 'tasks' queue.
          tasks.push( task );
        } else {
          // If the task is complete (remaining time is 0 or less),
          // log its name and the total time it took to complete.
          console.log( task[0], cur );
        }
      } // End of while loop for task processing.

    }
  ); // End of 'end' event listener.