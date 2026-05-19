process.stdin.resume();
process.stdin.setEncoding('utf8'); // Configure input encoding

process.stdin.on('data', function (inputData) {
    // Process the incoming data chunk:
    // 1. Convert to string representation.
    // 2. Remove any leading or trailing whitespace.
    // 3. Split the string into an array of lines.
    // 4. Discard the first line (often a count or header).
    // 5. For each remaining line, split it by space to get command parts.
    var processedLines = inputData.toString().trim().split('\n').slice(1).map(function (lineParts) {
        return lineParts.split(' ');
    });

    // Initialize an empty object to serve as a simple hash set or dictionary.
    // Keys will be the elements, values will indicate presence (e.g., true).
    var dataStore = {};

    // Iterate through each command extracted from the input lines.
    processedLines.forEach(function (currentCommand) {
        // Check the type of operation based on the first element of the command array.
        if (currentCommand[0] === 'insert') {
            // If the command is 'insert', add the second element as a key to our data store.
            // The value 'true' simply signifies its presence.
            dataStore[currentCommand[1]] = true;
        } else if (currentCommand[0] === 'find') {
            // If the command is 'find', check if the second element exists as a key in the data store.
            // Use the 'in' operator for efficient key existence check.
            // Output 'yes' if found, 'no' otherwise.
            console.log(currentCommand[1] in dataStore ? 'yes' : 'no');
        }
    });
});
