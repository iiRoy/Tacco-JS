'use strict';

// This primary routine handles the incoming data stream and orchestrates the query processing.
function ProcessQueries(rawData) {

    // First, segment the entire input string into an array of individual lines.
    // Each line represents either metadata or a specific query.
    rawData = rawData.split('\n');

    // The second line of the input (at array index 1) is designated as the primary
    // text sequence against which all subsequent queries will be performed.
    var targetString = rawData[1];


    // The remaining lines, starting from the third line (index 2), constitute
    // a collection of distinct search queries.
    var queryList = rawData.slice(2);

    // We now iterate through each individual query present in our query collection.
    for (var currentQuery of queryList) {

        // Every query string is expected to contain two space-separated numeric values.
        // These values define the start and end boundaries for a sub-segment extraction.
        var queryParts = currentQuery.split(' ');

        // From the main target string, we extract a specific sub-segment.
        // The query's first index is 1-based, so we adjust it to be 0-based for JavaScript's `slice` method.
        // The second index is already suitable for `slice` as it's exclusive.
        var subSegment = targetString.slice(queryParts[0] - 1, queryParts[1]);

        // Finally, we determine the count of 'AC' occurrences within the extracted sub-segment.
        // This is achieved by splitting the sub-segment by 'AC' and then counting the resulting array elements,
        // subtracting one to get the actual number of occurrences. The result is then printed to the console.
        console.log(subSegment.split('AC').length - 1);
    }
}

// To initiate the process, we read the entire content of standard input synchronously.
// The content is assumed to be UTF-8 encoded.
// This read data is then passed to our main processing function.
ProcessQueries(require("fs").readFileSync('/dev/stdin', 'utf8'));