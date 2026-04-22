var inputBuffer = []; // Stores all incoming lines from standard input.

var numItems, targetA, targetB, targetC; // Main configuration parameters for the problem.
var itemLengths; // Array to hold the lengths of individual items.
var minCost = Number.POSITIVE_INFINITY; // Initialize the minimum calculated cost to a very large value.

var lineReaderModule = require("readline");
var interfaceInstance = lineReaderModule.createInterface( {
    input: process.stdin, // Read from standard input stream.
    output: process.stdout // Write to standard output stream (not used for this problem, but required by interface).
} );

interfaceInstance.on( 'line' , function ( inputLine ) {
    // Add each received line to our buffer for later processing.
    inputBuffer.push(inputLine);
} );

interfaceInstance.on( 'close' , function ( ) {

    // Process the first line which contains configuration values.
    var configLine = inputBuffer.shift();
    numItems = Number( configLine.split(" ")[0] );
    targetA = Number( configLine.split(" ")[1] );
    targetB = Number( configLine.split(" ")[2] );
    targetC = Number( configLine.split(" ")[3] );

    itemLengths = Array(numItems); // Initialize array to hold item dimensions.

    // Populate the item lengths array from the remaining input lines.
    for ( var idx = 0 ; idx < numItems ; idx++ ) {
        itemLengths[idx] = Number(inputBuffer[idx]);
    }

    // Start the recursive exploration of item assignments.
    exploreCombinations(0, []);
    // Output the final minimum calculated expense.
    console.log(minCost);
} );

function exploreCombinations(currentIdx, assignmentArray) {
    // Base case: if all items have been assigned, evaluate the current configuration.
    if ( currentIdx === numItems ) {
        evaluateAssignment(assignmentArray);
        return 0; // Return a dummy value.
    }

    // Iterate through the four possible assignments for the current item.
    for ( var idx = 0 ; idx < 4 ; idx++ ) {
        assignmentArray[currentIdx] = idx; // Assign the current item to a group (0, 1, 2) or discard (3).
        // Recursively call for the next item.
        exploreCombinations(currentIdx + 1, assignmentArray);
    }
}

function evaluateAssignment(assignmentArray) {
    var currentA = 0; // Accumulated length for group A.
    var currentB = 0; // Accumulated length for group B.
    var currentC = 0; // Accumulated length for group C.
    var countA = 0; // Number of items assigned to group A.
    var countB = 0; // Number of items assigned to group B.
    var countC = 0; // Number of items assigned to group C.

    // Iterate through all items to calculate current group lengths and counts.
    for ( var idx = 0 ; idx < numItems ; idx++ ) {
        // Item assigned to group A.
        if ( assignmentArray[idx] === 0 ) {
            if ( itemLengths[idx] !== 0 ) {
                currentA = currentA + itemLengths[idx];
                countA++;
            }
        }
        // Item assigned to group B.
        else if ( assignmentArray[idx] === 1 ) {
            if ( itemLengths[idx] !== 0 ) {
                currentB = currentB + itemLengths[idx];
                countB++;
            }
        }
        // Item assigned to group C.
        else if ( assignmentArray[idx] === 2 ) {
            if ( itemLengths[idx] !== 0 ) {
                currentC = currentC + itemLengths[idx];
                countC++;
            }
        }
        // Item is discarded (not used for any group).
        else { /* No action needed for discarded items. */ }
    }

    // Adjust counts: if a group has items, subtract one (for the initial item, cost is 0).
    countA = ( countA - 1 < 0 ) ? 0 : ( countA - 1 ) ;
    countB = ( countB - 1 < 0 ) ? 0 : ( countB - 1 ) ;
    countC = ( countC - 1 < 0 ) ? 0 : ( countC - 1 ) ;

    // Only consider valid assignments where all three target groups have at least one item.
    if ( currentA > 0 && currentB > 0 && currentC > 0 ) {
        // Calculate the current total expense based on length differences and combination costs.
        var currentExpense = Math.abs(targetA - currentA) +
                             Math.abs(targetB - currentB) +
                             Math.abs(targetC - currentC) +
                             ( countA + countB + countC ) * 10 ;

        // Update the minimum cost if the current expense is lower.
        if ( minCost > currentExpense ) {
            minCost = currentExpense;
        }
    }
}