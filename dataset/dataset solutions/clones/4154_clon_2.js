// This module defines a core routine for text processing and comparison.
function ProcessInputData(initialPayload) {
    // Break down the raw input into individual lines for further processing.
    var lineSegments = initialPayload.split('\n');

    // Extract the characters of the first string from the first line.
    var firstCharList = lineSegments[0].split('');

    // Extract the characters of the second string from the second line.
    var secondCharList = lineSegments[1].split('');

    // Sort the characters of the first string lexicographically and convert back to a single string.
    var lexicographicallySortedFirst = firstCharList.sort((itemOne, itemTwo) => itemOne < itemTwo ? -1 : 1).toString();

    // Sort the characters of the second string lexicographically, then reverse, and convert to a single string.
    var reverseLexicographicallySortedSecond = secondCharList.sort((itemOne, itemTwo) => itemOne < itemTwo ? -1 : 1).reverse().toString();

    // Create an array containing the two processed strings for subsequent comparison.
    var comparisonStringsSet = [lexicographicallySortedFirst, reverseLexicographicallySortedSecond];

    // Duplicate the initial pair of processed strings to preserve their original relative order.
    var originalOrderStrings = [lexicographicallySortedFirst, reverseLexicographicallySortedSecond];

    // Sort the array of processed strings lexicographically.
    var orderedComparisonStrings = comparisonStringsSet.sort((itemOne, itemTwo) => itemOne < itemTwo ? -1 : 1);

    // Initial check: if the original character arrays are identical (by reference), output 'No'.
    if (firstCharList === secondCharList) {
        console.log('No');
    }
    // Otherwise, check if the first string in the original processed pair matches the first string
    // after the pair itself has been sorted.
    else if (originalOrderStrings[0] === orderedComparisonStrings[0]) {
        console.log('Yes');
    }
    // If neither of the above conditions is met, output 'No'.
    else {
        console.log('No');
    }

} // End of the main processing function.

// Entry point: Read data from standard input, decode as UTF-8, and pass to the processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));