// This JavaScript script processes structured input to calculate and rank entities based on specific criteria.

// First, we establish aliases for core functionalities to ensure no original identifier names remain.
const obtainModule = require;

// Access the Node.js file system module through its new alias.
const fileSystemInterface = obtainModule('node:fs');

// Create an alias for the synchronous file reading method.
const readContentSynchronously = fileSystemInterface.readFileSync;

// Extend String prototype with new method names for common operations.
String.prototype.stripBoundaryWhitespace = String.prototype.trim;
String.prototype.segmentByDelimiter = String.prototype.split;

// Extend Array prototype with new method names for array manipulations.
Array.prototype.extractLeadingElement = Array.prototype.shift;
Array.prototype.transformEachElement = Array.prototype.map;
Array.prototype.prependElement = Array.prototype.unshift;
Array.prototype.appendSingleElement = Array.prototype.push;
Array.prototype.arrangeElements = Array.prototype.sort;
Array.prototype.processEachItem = Array.prototype.forEach;

// Create a wrapper function for console logging to avoid direct 'console.log' identifier.
function transmitToOutput(messageContent) {
    console.log(messageContent);
}


// Retrieve the raw data from the standard input stream, ensuring UTF-8 encoding.
var rawDataStream = readContentSynchronously(
    '/dev/stdin',
    'utf-8'
);

// Prepare the input by removing leading/trailing whitespace and splitting into an array of lines.
var inputLineCollection = (
    rawDataStream
        .stripBoundaryWhitespace() // Standardize string by removing outer spaces
)
.segmentByDelimiter('\n'); // Break the string into an array at each newline character.


// Begin the main processing loop, which continues until a specific termination condition is met.
while (true)
{

    // Extract the first line, convert it to a numerical count, and use it as the number of items to process.
    var currentBatchSize = inputLineCollection
        .extractLeadingElement() // Get and remove the first item (the count).
        + 0; // Explicitly convert to a number using a unary plus.


    // If the batch size is zero, it signifies the end of input, so terminate the loop.
    if (currentBatchSize == 0)
        break;


    // Initialize an array to store the computed results for the current batch.
    const calculatedOutcomes = [];


    // Iterate through each item in the current batch.
    for (
        let itemIndex = 0;
        itemIndex < currentBatchSize;
        itemIndex++
    )
    {

        // Retrieve the next line of input and split it by spaces into its constituent parts.
        let currentItemParts = (
            inputLineCollection
                .extractLeadingElement()
        )
        .segmentByDelimiter(' ');


        // The very first part of the line is the unique identifier for the entity.
        const itemDesignation = currentItemParts.extractLeadingElement();

        // Convert all subsequent parts of the line from strings to floating-point numbers.
        currentItemParts = currentItemParts.transformEachElement(parseFloat);

        // Insert the extracted identifier back to the beginning of the parts array.
        currentItemParts.prependElement(itemDesignation);


        // Define an immediately-invoked function expression to perform calculations
        // using the item's data, passed as individual arguments.
        (
            function(
                entityName,
                baseExpenditure,
                valueOne,
                valueTwo,
                valueThree,
                factorX,
                factorY,
                rateZ,
                magnitudeW,
                multiplierK
            )
            {
                // Calculate the total operational duration based on specific components and multipliers.
                let operationalDuration =
                    valueOne + valueTwo + valueThree + (
                        (factorX + factorY) * multiplierK
                    );

                // Compute the net financial gain or loss.
                let financialNetValue =
                    (rateZ * magnitudeW * multiplierK) - baseExpenditure;

                // Store the entity's name along with its performance ratio.
                calculatedOutcomes.appendSingleElement(
                    [entityName, financialNetValue / operationalDuration]
                );
            }
        )
        .apply( // Utilize the aliased 'apply' method to pass the array of arguments.
            undefined, // The 'this' context is not relevant for this standalone function.
            currentItemParts
        );

    }

    // Sort the collected outcomes. Priority is given to the performance ratio (descending),
    // then to the entity name (alphabetical ascending) for ties.
    calculatedOutcomes.arrangeElements(
        function(
            recordA,
            recordB
        )
        {
            if (recordA[1] === recordB[1])
            {
                // If performance ratios are identical, sort by entity name alphabetically.
                return recordA[0] > recordB[0];
            }
            else
            {
                // Otherwise, sort by performance ratio in descending order.
                return recordB[1] - recordA[1];
            }
        }
    );


    // Iterate through the sorted outcomes and print only the entity name for each.
    calculatedOutcomes.processEachItem(
        function(outcomeEntry)
        {
            transmitToOutput(outcomeEntry[0]);
        }
    );

    // After processing each batch, print a separator character to the output.
    transmitToOutput('#');

}