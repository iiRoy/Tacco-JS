const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// This immediately invoked function expression (IIFE) processes the input data.
( ( inputContent ) => {

    // The input string is split into an array of individual lines.
    const dataRows = inputContent.split('\n');

    // The first line of the input specifies the total number of entries to process.
    // Subtracting zero is a common JavaScript idiom to convert a string to a number.
    const numEntries = dataRows[0] - 0;

    // An object is initialized to serve as a frequency map or a set.
    // It will store the unique items encountered and their "status" (unique or duplicate).
    const occurrenceMap = {};

    // Loop through the input lines, starting from the second line (index 1)
    // up to the number of entries specified by 'numEntries'.
    for ( let entryIndex = 0; entryIndex < numEntries; entryIndex++ ) {
        // Access the current item from the input lines.
        // We use `entryIndex + 1` because `dataRows[0]` is `numEntries`.
        const currentItem = dataRows[ entryIndex + 1 ];

        // Check if this item has been previously added to our occurrence map.
        if ( occurrenceMap[ currentItem ] ) {
            // If the item exists in the map, it means it's a duplicate.
            // We set its value to 0 to indicate it's no longer considered unique.
            occurrenceMap[ currentItem ] = 0;
        } else {
            // If the item is not yet in the map, it's a new, unique item.
            // We add it to the map with a value of 1.
            occurrenceMap[ currentItem ] = 1;
        }
    }

    // Initialize a variable to accumulate the count of truly unique items.
    let uniqueCount = 0;

    // Iterate over the keys (items) stored in our occurrence map.
    // The values associated with these keys are either 1 (unique) or 0 (duplicate).
    for ( let mapKey in occurrenceMap ) {
        // Add the value of each item in the map to our unique count.
        // Only items with a value of 1 will increment the count.
        uniqueCount += occurrenceMap[ mapKey ];
    }

    // Print the final calculated count of unique items to the standard output.
    console.log( uniqueCount );

} )( rawData ); // The raw input data is passed as an argument to the IIFE.
