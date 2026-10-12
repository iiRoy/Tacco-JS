var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.split('\n');

var firstCount = +dataRows.shift(); // The first number, 'n', is read but not used in the logic.

var searchElements = dataRows.shift().split(' '); // The array 'S' of elements to search within.

var secondCount = +dataRows.shift(); // The second number, 'q', is read but not used in the logic.

// The array 'T' of target elements, filtered to contain only unique values.
var targetElements = dataRows.shift().split(' ').filter(function(itemValue, idx, arrRef) {
    return arrRef.indexOf(itemValue) === idx;
});

// Create a hash map (or dictionary) for efficient lookup of elements from 'S'.
var elementMap = {};

// Populate the hash map with elements from 'searchElements'.
searchElements.forEach(function(currentElement) {
    elementMap[currentElement] = true; // Mark presence of the element.
});

// Initialize a counter for elements found.
var matchCounter = 0;

// Iterate through the unique 'targetElements' and check their presence in the 'elementMap'.
targetElements.forEach(function(checkElement) {
    if (elementMap[checkElement]) {
        matchCounter++; // Increment counter if the element is found.
    }
});

// Print the final count of unique target elements found in the search elements.
console.log(matchCounter);
