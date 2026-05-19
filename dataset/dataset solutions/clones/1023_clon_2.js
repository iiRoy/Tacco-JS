"use strict";

// Standard input setup for Node.js applications
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Variable to accumulate all incoming data
let rawData = '';

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(dataPiece) {
    rawData += dataPiece; // Append each chunk to rawData
});

// Event listener for 'end' of input stream
process.stdin.on('end', function() {
    // Once all input is received, split it into lines and pass to the main processing function
    processData(rawData.split(/\r?\n/));
});

/**
 * Main function to process the input data and simulate Round Robin scheduling.
 * @param {string[]} lines - An array of strings, where each string is a line from the input.
 */
function processData(lines) {
    // Parse the first line to get the total number of processes and the time quantum
    let numElements = Number(lines[0].split(' ')[0]);
    let quantumTime = Number(lines[0].split(' ')[1]);

    // Declare variables for managing the circular linked list of processes
    let currentProcess, previousProcess, tempNode, idx;
    let headNode = {}; // Initialize the first node (head) of the linked list

    // Populate the head node with data from the second input line
    headNode.processName = lines[1].split(' ')[0];
    headNode.remainingTime = Number(lines[1].split(' ')[1]);
    currentProcess = headNode; // currentProcess pointer starts at the head

    // Loop to create and link the remaining process nodes
    for (idx = 1; idx < numElements; idx++) {
        tempNode = {}; // Create a new temporary node
        tempNode.processName = lines[idx + 1].split(' ')[0];
        tempNode.remainingTime = Number(lines[idx + 1].split(' ')[1]);
        currentProcess.nextNode = tempNode; // Link the current node to the new node
        currentProcess = tempNode; // Move currentProcess to the newly added node
    }

    // Complete the circular linked list by linking the last node back to the head
    currentProcess.nextNode = headNode;
    previousProcess = currentProcess; // previousProcess points to the last node initially
    currentProcess = headNode; // Reset currentProcess to the head for the simulation
    headNode = tempNode = null; // Clear references to headNode and tempNode as they are no longer directly needed

    let elapsedTime = 0; // Initialize total elapsed time for scheduling

    // Simulate the Round Robin scheduling algorithm
    while (numElements > 0) {
        currentProcess.remainingTime -= quantumTime; // Decrease remaining time by the quantum
        elapsedTime += quantumTime; // Add the quantum to the total elapsed time

        if (currentProcess.remainingTime > 0) {
            // If the process still has time remaining, move to the next process in the circle
            currentProcess = currentProcess.nextNode;
            previousProcess = previousProcess.nextNode;
        } else {
            // If the process has finished (remainingTime <= 0)
            elapsedTime += currentProcess.remainingTime; // Adjust elapsed time (subtract any negative overshoot)
            console.log(`${currentProcess.processName} ${elapsedTime}`); // Output the process name and its completion time

            currentProcess = currentProcess.nextNode; // Move to the next process
            previousProcess.nextNode = currentProcess; // Remove the finished process from the circular list
            numElements--; // Decrement the count of active processes
        }
    }

    // Clean up references after all processes have completed
    currentProcess = previousProcess = null;
}
