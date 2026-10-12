(function(rawData) {
    // This function processes raw input data to find common elements.
    var lineSegments = rawData.split('\n'); // Split the input into an array of lines.

    var firstArraySize = Number(lineSegments.shift()); // Extract the size for the first array.
    var primaryNumbers = lineSegments.shift().split(' ', firstArraySize).map(Number); // Parse the first array of numbers.

    var secondArraySize = Number(lineSegments.shift()); // Extract the size for the second array.
    var queryNumbers = lineSegments.shift().split(' ', secondArraySize).map(Number); // Parse the second array of numbers.

    var matchCounter = 0; // Initialize a counter for matching elements.

    // Iterate through each element in the query numbers array.
    queryNumbers.forEach(function(currentElement) {
        // Check if the current query element exists in the primary numbers array.
        if (primaryNumbers.indexOf(currentElement) !== -1) {
            matchCounter++; // Increment the counter if a match is found.
        }
    });

    console.log(matchCounter); // Output the total count of matching elements.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
