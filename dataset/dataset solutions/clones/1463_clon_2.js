(function(rawData) {
    // This variable will store the input lines after splitting.
    var linesArray = rawData.split('\n');

    // The first line contains the count of elements for the initial collection.
    var firstArraySize = Number(linesArray.shift());

    // The next line provides the elements for the first collection, parsed as numbers.
    var firstArray = linesArray.shift().split(' ', firstArraySize).map(Number);

    // The subsequent line specifies the number of elements in the second collection.
    var secondArraySize = Number(linesArray.shift());

    // The final line contains the elements for the second collection, also parsed as numbers.
    var secondArray = linesArray.shift().split(' ', secondArraySize).map(Number);

    // Initialize a variable to keep track of the number of common elements.
    var matchCounter = 0;

    // Iterate through each element in the second collection.
    secondArray.forEach(function(currentItem) {
        // Check if the current element from the second collection exists in the first collection.
        if (firstArray.indexOf(currentItem) !== -1) {
            // If a match is found, increment the counter.
            matchCounter++;
        }
    });

    // Output the total count of matching elements to the console.
    console.log(matchCounter);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
