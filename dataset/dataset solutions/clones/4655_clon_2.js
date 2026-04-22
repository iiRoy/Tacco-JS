"use strict"
// This JavaScript module is designed to process an incoming data string.
function ProcessInputData(rawDataString)
{
    // The initial raw data is cleaned by removing leading/trailing whitespace
    // and then broken down into individual lines.
    rawDataString = rawDataString.trim().split('\n');

    // The first line of the input is parsed to determine the primary quantity.
    const itemQuantity = Number(rawDataString[0].trim());

    // The second line is processed: whitespace removed, values split by space,
    // converted to numerical types, and subsequently sorted in descending order.
    const descendingNumbers = rawDataString[1].trim().split(' ').map(Number).sort((valueOne, valueTwo) => valueTwo - valueOne);

    // A variable is initialized to hold the cumulative sum of selected elements.
    let totalAccumulator = 0;

    // A loop is initiated to traverse a specific range of indices within the sorted array.
    // The loop begins from the second element (index 1) and continues up to,
    // but not including, three times the item quantity.
    for
    (
        let iterationIndex = 1;
        iterationIndex < itemQuantity * 3;
        iterationIndex++
    )
    {
        // Inside the loop, a conditional check is performed:
        // if the current iteration index is an even number...
        if
        (
            iterationIndex % 2 === 0
        )
        {
            // ...then the numeric value at that specific index
            // from the descendingNumbers array is added to the total accumulator.
            totalAccumulator += descendingNumbers[iterationIndex];
        }
    }

    // Finally, the calculated total sum is displayed on the console.
    console.log(totalAccumulator);
}

// The main processing function is invoked with content read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));