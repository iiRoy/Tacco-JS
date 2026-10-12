const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input stream

const dataLines = rawData.trim().split('\n'); // Split the raw input into an array of lines
let [ numProcesses, quantumTime ] = dataLines.shift().split(' '); // Extract the number of processes (N) and quantum time (Q) from the first line

numProcesses = Number(numProcesses); // Convert the string N to a numerical value
quantumTime = Number(quantumTime); // Convert the string Q to a numerical value

// Define a class to represent a processing task
class Task {
  constructor(taskName, remainingTime) {
    this.taskName = taskName; // Stores the identifier for the task
    this.remainingTime = remainingTime; // Stores the time left for the task to complete
  }
}

const taskQueue = []; // Initialize an empty array to serve as our task queue

// Populate the task queue with processes from the input data
// Note: The loop starts from index 1, skipping the first process line if N refers to total lines including header.
// This behavior is preserved from the original code.
for (let idx = 1; idx < numProcesses; idx++) {
  const [ taskName, timeString ] = dataLines[idx].split(' '); // Parse task name and its initial time
  const currentTask = new Task(taskName, Number(timeString)); // Create a new Task object
  taskQueue.push(currentTask); // Add the newly created task to the end of the queue
}

let elapsedTime = 0; // Initialize a variable to accumulate the total elapsed time

// Process tasks in the queue using a modified round-robin scheduling approach
while (taskQueue.length > 0) { // Continue as long as there are tasks awaiting processing
  const currentTask = taskQueue.pop(); // Retrieve the last task added to the queue (LIFO for processing)
  const sliceDuration = Math.min(currentTask.remainingTime, quantumTime); // Determine the actual time slice for execution
  
  elapsedTime += sliceDuration; // Increment the total elapsed time by the executed slice duration
  currentTask.remainingTime -= sliceDuration; // Decrease the remaining time for the current task

  // Check if the task has completed or needs to be re-queued
  if (currentTask.remainingTime > 0) { // If the task still has time remaining
    taskQueue.unshift(currentTask); // Add it back to the beginning of the queue for future processing
  } else { // If the task has completed its execution
    console.log(currentTask.taskName + ' ' + elapsedTime); // Output the task name and its completion time
  }
}
