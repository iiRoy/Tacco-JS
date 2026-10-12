(function(incomingData) {
    // This variable will hold an array of strings, where each string is a line from the input.
    var linesArray = incomingData.split('\n');

    // We iterate through the array of lines. The loop condition uses the current length of the array,
    // which changes as elements are removed with 'shift()'.
    for (var idx = 0; idx < linesArray.length; idx++) {
        // Retrieve the first line from the array and parse it into an array of coordinate strings.
        // The 'shift()' method removes the first element from 'linesArray' and returns it.
        var coordinates = linesArray.shift().split(' ');

        // Check for the specific termination condition: if both coordinates are '0'.
        if (coordinates[0] === 0 && coordinates[1] === 0) {
            // If the termination condition is met, exit the anonymous function.
            return;
        }

        // Sort the coordinate strings numerically in ascending order.
        // The comparison function 'valA - valB' ensures a numeric sort.
        // Then, join the sorted numbers back into a single string, separated by a space,
        // and print this result to the standard output.
        console.log(coordinates.sort(function(valA, valB) {
            return valA - valB;
        }).join(' '));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
