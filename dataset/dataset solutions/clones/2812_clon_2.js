'use strict';

// Main routine to handle input data and perform calculations
function processInput(  rawData  )
{
    // Split the entire input string into an array of individual text lines
    const textLines = rawData.split('\n');

    // Parse the first line to get the total number of elements to process
    const numElements = parseInt(textLines.shift(), 10);

    // Initialize an array to store all the parsed work items
    let workItems = [];

    // Loop through the specified number of elements to extract and parse each one
    for ( let idx = 0; idx < numElements; idx++ )
    {
        // For each line, split by space, then convert each part to an integer, and add to workItems
        workItems.push(
            textLines.shift()
                     .split(' ')
                     .map(
                        (numStr) => parseInt(numStr, 10)
                     )
        );
    }

    // Sort the collection of work items based on their second attribute (e.g., deadline) in ascending order
    workItems.sort( (itemA, itemB) => itemA[1] - itemB[1] );

    // We can uncomment the line below for debugging purposes to see the sorted data
    // console.log("Sorted work items for analysis:", workItems);

    // Initialize a status flag, assuming success until proven otherwise
    let completionStatus = 'Yes';
    // Initialize a variable to track the cumulative time spent on tasks
    let accumulatedTime = 0;

    // Iterate through the sorted work items to determine if all can be completed within their deadlines
    for ( let idx = 0; idx < numElements; ++idx )
    {
        // Add the duration of the current work item to the total accumulated time
        accumulatedTime += workItems[idx][0];

        // Check if the deadline of the current work item is earlier than the accumulated time
        if ( workItems[idx][1] < accumulatedTime )
        {
            // If a deadline is missed, set the status to 'No' and stop further checks
            completionStatus = 'No';
            break;
        }
    }

    // Output the final determination of whether all work items can be completed successfully
    console.log( completionStatus );
}

// Execute the main processing function by reading input from standard input
processInput(
    require('node:fs').readFileSync('/dev/stdin', 'utf8')
);