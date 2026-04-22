// This module processes textual data to identify duplicate numerical entries.
var parsedFragments =     []; // Array to hold segments of the initial text input.
var tallyMap          = []; // An array acting as a hash map to store occurrence counts.

// 'incomingString' is assumed to be the raw input content, similar to a file read.
// The splitting pattern looks for a comma, followed by digits, then optional newlines.
parsedFragments = incomingString/* This placeholder simulates a file read operation */.split(/,\d+\n{0,}/);

// Capture the total count of fragments for loop iteration.
var fragmentCount = parsedFragments.length;

var currentNumericItem; // A temporary variable to hold the integer value of each fragment.

var finalOutputString = ""; // String accumulator for the results.

// First pass: Iterate through the fragments to populate the tally map.
for ( var    fragmentIndex = 0;    fragmentIndex < fragmentCount - 1;    fragmentIndex++ ) {
    // Convert the string fragment into its integer representation.
    currentNumericItem = parseInt(parsedFragments[fragmentIndex]);

    // Check if this number has been registered in our tally map yet.
    if (tallyMap[currentNumericItem]    ===    undefined) {
        // If new, initialize its count to one.
        tallyMap[currentNumericItem] = 1;
    }    else {
        // If seen before, increment its existing count.
        tallyMap[currentNumericItem]++;
    }
}

// Update the fragmentCount to reflect the size of the tally map for the second loop.
fragmentCount = tallyMap.length;

// Second pass: Iterate through the tally map to construct the final report.
for (fragmentIndex = 0; fragmentIndex < fragmentCount; fragmentIndex++) {
    // Only include numbers that appeared more than once in the output.
    if (tallyMap[fragmentIndex] !== undefined && tallyMap[fragmentIndex] > 1)
    {
        finalOutputString += (fragmentIndex + ' ' + tallyMap[fragmentIndex] + '\n');
    }
}

// Display the generated report containing duplicate numbers and their frequencies.
console.log(finalOutputString);