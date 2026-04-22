const fileSystemModule = require('fs'); // Acquire the file system utility.

let rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8'); // Fetch raw text from standard input.

let lineFragments = rawInputData.trim().split('\n'); // Pre-process input: remove borders and segment into an array of lines.

// Commence a continuous processing cycle.
while (true) {
    let currentLineSegment = lineFragments.shift(); // Extract the leading line segment for current iteration.

    // Evaluate if the termination sequence has been encountered.
    if (currentLineSegment === '0 0 0 0 0') {
        break; // Discontinue the loop if the sentinel pattern is matched.
    }

    // Amalgamate the current segment with the subsequent line, then parse into an array of numerical values.
    let numericValues = (currentLineSegment + ' ' + lineFragments.shift()).split(' ').map(Number);

    // An ephemeral function is executed immediately, taking distinct numerical parameters for intricate computations.
    (function(valX, valY, valZ, divisor, unitCost, countX, countY, totalUnits) {
        // Compute an foundational expense based on the integral division of units.
        let baseCost = Math.floor(totalUnits / divisor) * divisor * unitCost;

        // Ascertain the quantity of units that are left over after the primary division.
        let remainingUnits = totalUnits % divisor;

        // Define a computational pathway, referred to as 'EvaluationStrategyOne'.
        // This strategy integrates the residual units and item counts.
        let evaluationStrategyOne = (function(currentResult) {
            currentResult += remainingUnits * valZ; // Incorporate cost for leftover units.
            currentResult += countX * valX + countY * valY; // Add costs for individual components.
            return currentResult; // Deliver the cumulative cost from this strategy.
        })(baseCost); // Initialize this strategy with the pre-calculated foundational expense.

        // Define a secondary computational pathway, named 'EvaluationStrategyTwo'.
        // This strategy employs conditional logic contingent on the initial foundational expense.
        let evaluationStrategyTwo = (function(initialResult, quantityX, quantityY) {
            // Should the initial result be zero, implying no bulk units were directly processed.
            if (initialResult === 0) {
                // Determine if any supplementary units are required to complete a full 'divisor' block.
                let neededPadding = (remainingUnits === 0) ? 0 : divisor - remainingUnits;
                // If such padding is necessitated, accrue the cost of a complete block.
                if (neededPadding > 0) {
                    initialResult += unitCost * divisor;
                }
                // Adjust the counts of individual items by decrementing them for the 'neededPadding'.
                // This simulates the consumption of items to fulfill the padding requirement.
                while (neededPadding--) {
                    if (quantityY > 0) {
                        quantityY--;
                    } else if (quantityX > 0) {
                        quantityX--;
                    }
                }
                initialResult += quantityX * valX + quantityY * valY; // Append costs for any remaining individual items.
                return initialResult; // Yield the final expense for this particular branch.
            }
            // Conversely, if the initial result was non-zero, indicating the presence of bulk units.
            if (initialResult !== 0) {
                return quantityX * valX + quantityY * valY + totalUnits * unitCost; // Compute cost by combining individual items and total units' expense.
            }
        })(baseCost, countX, countY); // Furnish the foundational expense and individual counts to this strategy.

        // Present the lesser of the two computed strategies' results to the console.
        console.log(Math.min(evaluationStrategyOne, evaluationStrategyTwo));

    }).apply(null, numericValues); // Invoke the function, passing the parsed numerical values as its arguments.
}