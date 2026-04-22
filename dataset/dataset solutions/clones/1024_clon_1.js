/*
 * This JavaScript file processes a list of tasks (processes)
 * according to a specific scheduling algorithm, likely Round Robin.
 * It reads input from standard input, parses it, simulates the
 * process execution, and prints the completion times.
 */

// Import the 'fs' (file system) module to read input.
const input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Process the raw input string:
// - Trim any leading/trailing whitespace.
// - Split it into an array of lines.
const list = input . trim() . split ( '\n' ) ;


// The first line of input contains two numbers:
// - n: The total number of processes.
// - q: The time quantum for each process execution.
let [ n , q ] = list . shift() . split ( ' ' ) ;

// Convert 'n' from string to a number type.
n = Number ( n ) ;

// Convert 'q' from string to a number type.
q = Number ( q ) ;


/**
 * Defines a Process class to represent each task.
 * Each process has a name and a remaining time to completion.
 */
class Process
{
  /**
   * Constructor for the Process class.
   * @param {string} name - The name or identifier of the process.
   * @param {number} time - The remaining execution time for the process.
   */
  constructor ( name , time )
  {
    // Assign the provided name to the process instance.
    this.name = name ;
    // Assign the provided time to the process instance.
    this.time = time ;
  }
} // End of Process class definition.


// Initialize an empty array that will serve as our process queue.
// This queue will hold Process objects.
const queue = [ ] ;

/*
 * Loop through the remaining lines of input to create Process objects.
 * The loop starts from index 1 because the first line (index 0) was
 * already processed for 'n' and 'q'.
 */
for ( let i = 1 ; i < n ; i++ )
{
  // Each subsequent line contains a process name and its initial time,
  // separated by a space.
  const [ name , time ] = list[i] . split ( ' ' ) ;

  // Create a new Process instance with the parsed name and time.
  // Convert the time string to a number.
  const p = new Process ( name , Number ( time ) ) ;

  // Add the newly created process to the end of the queue.
  queue . push ( p ) ;
}


// Initialize a variable to keep track of the total elapsed time.
let totalTime = 0 ;

// Main simulation loop: continue as long as there are processes in the queue.
while ( queue . length !== 0 )
{
  // Retrieve the first process from the queue (FIFO - First-In, First-Out).
  // Note: Using pop() here implies a stack-like behavior if not careful.
  // The original code uses `pop()` and `unshift()`, effectively simulating a queue
  // where elements are taken from the end and re-added to the beginning.
  // This is a common pattern for Round Robin when using an array as a deque.
  const p = queue . pop() ;

  // Determine how much time this process will execute in this turn.
  // It's either its remaining time or the time quantum 'q', whichever is smaller.
  const executeTime = Math . min ( p . time , q ) ;

  // Add the executed time to the total elapsed time.
  totalTime += executeTime ;

  // Reduce the process's remaining time by the amount executed.
  p . time -= executeTime ;

  // Check if the process still has remaining time.
  if ( p . time )
  {
    // If it does, put it back at the beginning of the queue (for the next round).
    queue . unshift ( p ) ;
  }
  else
  {
    // If the process has completed (p.time is 0), print its name and total completion time.
    console . log ( p . name + ' ' + totalTime ) ;
  }
}

// End of script execution.