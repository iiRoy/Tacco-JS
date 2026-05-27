var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataLines = fileContent.trim().split('\n'); // Separate the input into an array of individual lines.

var firstList = []; // Initialize an array to hold elements from the first part of the input.
var currentLine; // Declare a variable to store the line being processed.

// Populate the first list by taking the first comma-separated value from each line.
while (currentLine = dataLines.shift()) {
    firstList.push(currentLine.split(',')[0]);
}

var secondList = []; // Initialize an array for elements from the second part of the input.

// Populate the second list using the remaining lines from the input.
while (currentLine = dataLines.shift()) {
    secondList.push(currentLine.split(',')[0]);
}

// Sort the first list numerically in ascending order.
firstList.sort(function(a, b) {
    return a - b;
});

// Iterate through each item in the sorted first list.
firstList.forEach(function(currentItem) {
    // Determine how many times the current item appears in the second list.
    var matchCount = secondList.filter(function(element) {
        return element == currentItem;
    }).length;

    // If the item is found in the second list, proceed to calculate and print.
    if (matchCount > 0) {
        // Count the occurrences of the current item within the first list itself.
        var totalMatchCount = firstList.filter(function(element) {
            return element == currentItem;
        }).length;
        // Output the item and the sum of its counts from both lists.
        console.log(currentItem, matchCount + totalMatchCount);
    }
});
