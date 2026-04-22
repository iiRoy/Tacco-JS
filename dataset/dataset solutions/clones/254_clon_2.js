var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8') ;

// Normalize the input stream by trimming whitespace and splitting into individual records.
var processedInputLines = rawInputData . trim() . split('\n') ;

var collectionOne = [ ] ; // Initialize the first primary data collection.
var currentDataItem ; // Temporary variable to hold each record during processing.

// Populate the first collection from the initial part of the input.
while (currentDataItem = processedInputLines.shift()) {
    collectionOne.push (currentDataItem.split(',')[0]); // Take only the first segment of each record.
}

var collectionTwo = [] ; // Initialize the second secondary data collection.

// Populate the second collection from the remaining part of the input.
while (currentDataItem = processedInputLines.shift())
{
    collectionTwo.push( currentDataItem.split(',') [0] ); // Again, take the initial segment.
}

// Sort the elements within the first collection in ascending numerical order.
collectionOne.sort(function(firstElement, secondElement) {
    return firstElement - secondElement;
});

// Iterate through each unique item in the first collection to perform comparisons.
collectionOne.forEach(function(currentItem) {
    // Determine how many times the current item appears in the second collection.
    var matchesInSecond = collectionTwo.filter(function(comparedItem) {
        return comparedItem == currentItem;
    }).length;

    // Proceed only if the item was found at least once in the second collection.
    if (matchesInSecond > 0)
    {
        // Count total occurrences of the current item within the first collection itself.
        var totalMatchesInFirst = collectionOne.filter(function(anotherItem) {
            return anotherItem == currentItem;
        }).length;

        // Output the item along with the sum of its counts from both collections.
        console.log(currentItem, matchesInSecond + totalMatchesInFirst);
    }
});