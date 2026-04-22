const   rawData = require('fs').readFileSync('/dev/stdin', 'utf8')
;
/*
 * This section processes the raw input string
 * into manageable lines.
 */
const lineFragments = rawData.trim()
  .split('\n')
;

let [ totalTasksStr, timeSliceStr ] = lineFragments.shift()
    .split(' ');

const totalTasks = Number(totalTasksStr);
const timeSlice = Number(timeSliceStr);


/*
 * Defines a class to represent individual tasks
 * with their names and remaining execution time.
 */
class TaskEntity {
  constructor ( taskIdentifierParam , remainingDurationParam ) {
    this.taskIdentifier = taskIdentifierParam;
    this.remainingDuration = remainingDurationParam;
  }
}

// Initialize the main processing sequence (queue)
const processingSequence = [];

/*
 * Populates the processing sequence with tasks
 * read from the input line fragments.
 */
for ( let idx = 1 ; idx < totalTasks ; idx++ )
{
  const [ taskName, durationStr ] = lineFragments[idx].split(' ');
  const currentTask = new TaskEntity(taskName, Number(durationStr));
  processingSequence.push(currentTask);
}

// Variable to accumulate the total elapsed time
let elapsedTime = 0;

/*
 * Main loop: processes tasks until the queue is empty.
 * Implements a round-robin scheduling mechanism.
 */
while ( processingSequence.length !== 0 ) {
    const activeItem = processingSequence.pop(); // Get task from the end (acting as a queue)

    // Determine how much time this task will execute in this quantum
    const quantumConsumed = Math.min(activeItem.remainingDuration, timeSlice);

    elapsedTime += quantumConsumed; // Update total elapsed time
    activeItem.remainingDuration -= quantumConsumed; // Deduct executed time from task

    // If the task still has time remaining, put it back at the front of the queue
    if ( activeItem.remainingDuration > 0 ) {
        processingSequence.unshift(activeItem);
    }
    // Otherwise, the task is complete; print its name and completion time
    else {
        console.log(activeItem.taskIdentifier + ' ' + elapsedTime);
    }
}