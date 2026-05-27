(function(rawInputData) {
    // Split the entire input string into an array of lines
    var inputLines = rawInputData.split('\n');

    // Extract the first number, which represents the count of elements in the first array
    var sizeOfFirstArray = Number(inputLines.shift());

    // Extract the second line, split it by spaces, and convert each part to a number
    // This forms the first array of numbers
    var firstNumberArray = inputLines.shift().split(' ', sizeOfFirstArray).map(Number);

    // Extract the third number, representing the count of elements in the second array
    var sizeOfSecondArray = Number(inputLines.shift());

    // Extract the fourth line, split it by spaces, and convert each part to a number
    // This forms the second array of numbers
    var secondNumberArray = inputLines.shift().split(' ', sizeOfSecondArray).map(Number);

    // Initialize a counter for matching elements
    var totalMatches = 0;

    // Iterate over each element in the second array
    secondNumberArray.forEach(function(currentElement) {
        // Check if the current element from the second array exists as an index in the first array.
        // Note: This uses the 'in' operator, which checks for property existence (indices for arrays),
        // not value presence.
        if (currentElement in firstNumberArray) {
            // If it exists as an index, increment the match counter
            totalMatches++;
        }
    });

    // Output the final count of matches to the console
    console.log(totalMatches);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
