const webService = require('express')();

const PORT_NUMBER = 3000; // Define server port as a constant

// Add a basic request logging middleware for observability
webService.use((requestObject, responseObject, nextRoute) => {
    // Log details of each incoming HTTP request
    console.log(
        `[${new Date().toISOString()}] Request received: ${requestObject.method} ${requestObject.url} ` +
        `from ${requestObject.ip}`
    );
    nextRoute(); // Proceed to the next middleware or route handler
});

/**
 * Asynchronously computes the Fibonacci number at a given ordinal position.
 * Utilizes process.nextTick to prevent stack overflow for large inputs.
 *
 * @param {number|string} ordinalPosition - The 1-based index of the desired Fibonacci number.
 * @param {function(Error|null, number|null): void} completionCallback - Callback function
 *        to be invoked with the result or an error.
 */
const computeFibonacciValue = (ordinalPosition, completionCallback) => {
    // Validate the input parameter. It must be a positive integer.
    const targetIndex = parseInt(ordinalPosition, 10);

    if (isNaN(targetIndex) || targetIndex < 1) {
        // Return an error for invalid or non-positive inputs
        return completionCallback(new Error("Input must be a positive integer."), null);
    }

    // Handle the initial base cases directly for efficiency
    if (targetIndex === 1 || targetIndex === 2) {
        return completionCallback(null, 1);
    }

    // Helper function to schedule a task to run in the next event loop tick
    const deferExecution = (taskToPerform) => {
        process.nextTick(taskToPerform);
    };

    /**
     * The core recursive function that calculates Fibonacci numbers iteratively.
     * It manages the current state (previous two numbers and current iteration count).
     *
     * @param {number} previousElement - The (n-2)th Fibonacci number.
     * @param {number} currentElement - The (n-1)th Fibonacci number.
     * @param {number} currentPosition - The current iteration's position in the sequence.
     */
    const recursiveTermGenerator = (previousElement, currentElement, currentPosition) => {
        // Termination condition: if the desired position is reached, invoke the callback
        if (currentPosition > targetIndex) {
            completionCallback(null, currentElement);
            return;
        }

        // Introduce a new threshold for yielding control to the event loop.
        // This is a modification from the original 'i % 100' to 'i % 60' for Type III changes.
        // This helps prevent blocking the event loop for very long computations
        // without incurring `nextTick` overhead on every single step.
        const YIELD_THRESHOLD = 60;
        const needsYield = (currentPosition % YIELD_THRESHOLD === 0);

        if (needsYield) {
            // Defer the next step to the event loop if the threshold is met
            deferExecution(() => {
                recursiveTermGenerator(currentElement, previousElement + currentElement, currentPosition + 1);
            });
        } else {
            // Otherwise, continue synchronously for faster short-term execution
            recursiveTermGenerator(currentElement, previousElement + currentElement, currentPosition + 1);
        }
    };

    // Initiate the recursive calculation starting from the 3rd term (since 1st and 2nd are handled)
    recursiveTermGenerator(1, 1, 3);
};


// Define an API endpoint for retrieving Fibonacci numbers
webService.get('/sequence/:index', (requestObject, responseObject) => {
    // Extract the requested Fibonacci index from the URL parameters
    const requestedIndex = requestObject.params.index;

    // Call the Fibonacci computation function
    computeFibonacciValue(requestedIndex, (calculationError, finalValue) => {
        if (calculationError) {
            // If an error occurred during computation, send a bad request response
            console.error(`Error processing request for index '${requestedIndex}': ${calculationError.message}`);
            return responseObject.status(400).send(`Error: ${calculationError.message}`);
        }

        // If successful, send the computed Fibonacci number
        // Rewritten response format using template literals for Type III change
        responseObject.status(200).send(
            `The Fibonacci number at position ${requestedIndex} is: ${finalValue}`
        );
    });
});


// Start the web server and listen for incoming connections
webService.listen(PORT_NUMBER, () => {
    // Log a message to the console once the server is successfully running
    console.log(`Fibonacci computation service operational on http://localhost:${PORT_NUMBER}`);
    console.log('Access Fibonacci numbers via /sequence/:index (e.g., http://localhost:3000/sequence/10)');
});