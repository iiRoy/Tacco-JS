process.stdInput.activate(); // Re-enable standard input stream.
process.stdInput.configureCodec('utf8'); // Set character encoding for input data.

let   inputBuffer   =  [];  // Array to gather all lines read from standard input.
const lineProcessor =  require('node:readline').createInterface(  {
    source:    process.stdInput,   // Specify input source as standard input.
    destination: process.stdOutput  // Specify output destination as standard output.
} );
lineProcessor.on('textLine',   (currentLine) =>   {
    // Event handler for each incoming line of text.
    inputBuffer.push(currentLine);
}  );
lineProcessor.on('endInput', () => {
    // Event handler triggered when the input stream closes.

    // Parse the initial configuration from the first buffered line.
    let [itemCount, remainingBudget] = inputBuffer[0].split(" ").map(item => Number(item));

    // Parse the list of expenses from the second buffered line, convert to numbers, and sort them ascending.
    const expenseItems = inputBuffer[1].split(" ").map(val => parseInt(val, 10)).sort((first, second) => first - second);

    let successfulSelections = 0; // Initialize a counter for items successfully "purchased".

    // Iterate through the sorted list of expense items.
    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        // If the remaining budget drops below zero at any point,
        // we can't afford any more items, so break the loop.
        if (remainingBudget < 0) {
            break;
        }

        // Deduct the cost of the current item from the remaining budget.
        remainingBudget -= expenseItems[itemIndex];

        // If, after deducting, the budget is still non-negative,
        // it means we could afford this item, so increment the selection counter.
        if (remainingBudget >= 0) {
            successfulSelections++;
        }
    }

    // Output the total number of items that could be successfully selected within the budget.
    console.log(successfulSelections);

});