/*
 * This module orchestrates a fundamental repetitive logging process.
 * Its core function is to execute a defined action a specific number of times,
 * demonstrating basic iteration and conditional output within JavaScript.
 * This implementation aims for clarity and structural alteration from a
 * simpler iterative construct.
 */

// Establish the upper boundary for our iteration sequence.
// This constant dictates how many times the primary action will be performed.
const MAXIMUM_EXECUTION_COUNT = 1000;

// Define the primary textual content that will be displayed during each cycle.
// Using a constant ensures consistency across all output operations.
const PRIMARY_LOG_MESSAGE_CONTENT = "Hello World";

/**
 * Initiates and manages a sequence of console output operations.
 * This function encapsulates the entire iterative logic, ensuring modularity
 * and separation of concerns for the logging process.
 */
function activateIterativeDisplaySequence() {
  // Initialize a mutable counter to track the current position within the loop.
  // This counter will be incremented with each successful iteration.
  let currentOperationIndex = 0;

  // Commence the iterative process. The loop will continue as long as
  // the current index remains strictly less than our predefined maximum count.
  while (currentOperationIndex < MAXIMUM_EXECUTION_COUNT) {
    // Introduce a conditional check to vary the output based on the iteration parity.
    // This adds a minor layer of complexity and demonstrates branching logic.
    if (currentOperationIndex % 2 === 0) {
      // For even-numbered iterations, log the standard message, appending the index.
      // This provides context for each specific output.
      console.log(`> ${PRIMARY_LOG_MESSAGE_CONTENT} [Iteration: ${currentOperationIndex}]`);
    } else {
      // For odd-numbered iterations, output a slightly modified message.
      // This showcases an alternative path within the loop's execution.
      console.log(`-*- ${PRIMARY_LOG_MESSAGE_CONTENT} (Alternate Display) -*-`);
    }

    // Crucially, increment the operation index to ensure progress
    // towards the loop's termination condition.
    currentOperationIndex++;
  }

  // Once the loop has naturally concluded after all iterations,
  // output a final confirmation message to signify completion.
  console.log(`\n--- Iterative display sequence concluded after ${MAXIMUM_EXECUTION_COUNT} cycles. ---`);
}

// Execute the main function to trigger the entire sequence of operations.
// This single call initiates the repetitive console output.
activateIterativeDisplaySequence();