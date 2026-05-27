function processInput(rawData) {
    // Initialize a counter for the final result
    var resultCount = 0;

    // Split the entire raw input string into an array of lines
    var parsedLines = rawData.split('\n');

    // Extract the total number of participants and the available quantity of sweets
    // The original code implicitly converts these strings to numbers during comparison/iteration.
    // We explicitly convert them to integers for clarity and robustness.
    var totalParticipants = parseInt(parsedLines[0].split(' ')[0], 10);
    var availableSweets = parseInt(parsedLines[0].split(' ')[1], 10);

    // Parse the individual demand requests from the second line
    // Convert each demand string to a number immediately
    var individualRequests = parsedLines[1].split(' ').map(Number);

    // Sort the individual demand requests in ascending order
    // This strategy ensures that we satisfy people with smaller demands first,
    // maximizing the number of people served given a limited supply.
    individualRequests.sort(function(valA, valB) {
        return valA - valB;
    });

    var currentSweetSum = 0; // Accumulator for the total sweets distributed so far

    // Iterate through the sorted demands, attempting to satisfy each person
    for (var idx = 0; idx < totalParticipants; idx++) {
        // Update the count of people whose demands have been considered (and potentially met)
        resultCount = idx;

        // Add the current person's demand to the running total of distributed sweets
        currentSweetSum += individualRequests[idx];

        // Check if the accumulated demand exceeds the total available sweets
        if (currentSweetSum > availableSweets) {
            // If demand exceeds supply, output the number of people who could be satisfied
            console.log(resultCount);
            // Terminate the loop as no more people can be satisfied
            break;
        }
    }

    // Output the final result count.
    // This will be the last `resultCount` value, either from the break inside the loop
    // or the final `totalParticipants` if all demands could be met.
    console.log(resultCount);
}

// Read the entire content of standard input synchronously and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
