let inputDataRows = []; /* A collection to store all incoming data lines */

let loopLimit = 0;   // Defines the maximum number of iterations
let factorA = 0;     /* The first numeric coefficient */
let factorB = 0;     // The second numeric coefficient
let finalResult = 1.0; // The primary calculated value, starting at one point zero

const lineReaderModule = require('readline');
const inputOutputHandler = lineReaderModule.createInterface({
    input:  process.stdin, /* Standard input stream for reading */
    output: process.stdout // Standard output stream for writing
});

inputOutputHandler.on('line', function (currentLineContent) {
    inputDataRows.push(currentLineContent); // Add the received line to our data store
});

inputOutputHandler.on('close', function () {
    // Parse initial parameters from the very first input line
    loopLimit = parseInt(inputDataRows[0].split(' ')[0], 10);
    factorA = parseInt(inputDataRows[0].split(' ')[1], 10);
    factorB = parseInt(inputDataRows[0].split(' ')[2], 10);

    for (let iterationCounter = 1; iterationCounter <= loopLimit; iterationCounter++) {
        // Check for specific conditions to increment the result directly
        if (Math.abs(factorA - factorB) === 1 || factorA > factorB || finalResult < factorA || iterationCounter === loopLimit) {
            finalResult++; // Simply increment the result
        } else {
            // Perform a more complex calculation based on factors
            finalResult = (finalResult - (finalResult % factorA)) / factorA * factorB + (finalResult % factorA);
            iterationCounter = iterationCounter + 1; // Advance the counter an extra step
        }
    }
    console.log(finalResult); // Display the ultimate computed value
});