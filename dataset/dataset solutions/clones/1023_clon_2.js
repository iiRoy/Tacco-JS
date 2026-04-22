"use strict";

// Access the global execution environment object
const systemEnvironment = process;
// Obtain a reference to the standard logging utility
const loggingUtility = console;

// Alias standard input stream property and its methods for clarity and renaming
const inputSource = systemEnvironment.stdin;
const activateInputStream = inputSource.resume;
const setInputStreamEncoding = inputSource.setEncoding;
const attachStreamEventHandler = inputSource.on;

let receivedInputBuffer = ''; // Buffer to accumulate all incoming data

// Enable the input stream to start receiving data
activateInputStream.call(inputSource);
// Configure the text encoding for the input stream
setInputStreamEncoding.call(inputSource, 'utf-8');

// Register a callback function to handle incoming data chunks
attachStreamEventHandler.call(inputSource, 'data', function(incomingSegment) {
    receivedInputBuffer += incomingSegment;
});

// Register a callback function for when the input stream ends
attachStreamEventHandler.call(inputSource, 'end', function() {
    // Define a regular expression to split the input into lines
    const newlineDelimiter = /\r?\n/;
    // Initiate the main simulation process with the parsed input lines
    executeRoundRobinSimulation(receivedInputBuffer.split(newlineDelimiter));
});


function executeRoundRobinSimulation(inputDataSet) {
    // Parse the initial configuration values from the first line of the input data
    let totalElements = parseFloat(inputDataSet[0].split(' ')[0]);
    let timeQuantum = parseFloat(inputDataSet[0].split(' ')[1]);

    // Declare various pointer variables and a temporary node holder
    let currentTaskPointer, previousTaskPointer, temporaryTaskNode, iterationCounter;
    // Initialize the head node of the circular linked list of tasks
    let initialTaskNode = {};

    // Populate the first task node with its identifier and initial remaining time
    initialTaskNode.taskIdentifier = inputDataSet[1].split(' ')[0];
    initialTaskNode.remainingTime = parseFloat(inputDataSet[1].split(' ')[1]);
    // Set the current pointer to the initial task node
    currentTaskPointer = initialTaskNode;

    // Construct the circular linked list by iterating through the remaining input lines
    for (iterationCounter = 1; iterationCounter < totalElements; iterationCounter++) {
        temporaryTaskNode = {}; // Create a new node for the current task
        temporaryTaskNode.taskIdentifier = inputDataSet[iterationCounter + 1].split(' ')[0];
        temporaryTaskNode.remainingTime = parseFloat(inputDataSet[iterationCounter + 1].split(' ')[1]);
        // Link the previous node's 'nextTask' property to this new temporary node
        currentTaskPointer.nextTask = temporaryTaskNode;
        // Advance the current pointer to the newly created node
        currentTaskPointer = temporaryTaskNode;
    }

    // Close the circle of the linked list by connecting the last node to the first
    currentTaskPointer.nextTask = initialTaskNode;
    // Set the 'previousTaskPointer' to the last element of the list
    previousTaskPointer = currentTaskPointer;
    // Reset 'currentTaskPointer' to the first element to begin the simulation
    currentTaskPointer = initialTaskNode;
    // Dereference the initial node and temporary node variables to prevent unintended access
    initialTaskNode = temporaryTaskNode = null;

    let accumulatedExecutionTime = 0; // Variable to track the total elapsed time

    // Begin the main round-robin scheduling simulation loop
    while (totalElements > 0) {
        // Deduct the quantum time from the current task's remaining time
        currentTaskPointer.remainingTime -= timeQuantum;
        // Add the quantum time to the total accumulated execution time
        accumulatedExecutionTime += timeQuantum;

        if (currentTaskPointer.remainingTime > 0) {
            // If the current task still has time remaining, move both pointers to the next task
            currentTaskPointer = currentTaskPointer.nextTask;
            previousTaskPointer = previousTaskPointer.nextTask;
        } else {
            // The current task has completed its execution
            // Adjust the accumulated time to account for any over-deduction by the quantum
            accumulatedExecutionTime += currentTaskPointer.remainingTime;
            
            // Output the completed task's identifier and its total completion time
            loggingUtility.log(`${currentTaskPointer.taskIdentifier} ${accumulatedExecutionTime}`);
            
            // Remove the completed task from the circular list by bypassing it
            currentTaskPointer = currentTaskPointer.nextTask;
            previousTaskPointer.nextTask = currentTaskPointer;
            // Decrement the count of active elements in the list
            totalElements--;
        }
    }

    // After the simulation concludes, clear any remaining pointer references
    currentTaskPointer = previousTaskPointer = null;
}