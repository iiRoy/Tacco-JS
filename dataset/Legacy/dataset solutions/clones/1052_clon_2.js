var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input into individual lines

var countElements = +dataRows.shift(); // Get the number of elements for the main array
var elementArray = dataRows.shift().trim().split(' ').map(function(numStr) { return +numStr; }); // Parse the main array of numbers
var queryCount = +dataRows.shift(); // Get the number of queries
var queryArray = dataRows.shift().trim().split(' ').map(function(numStr) { return +numStr; }); // Parse the array of target sums for queries

queryArray.forEach(function(targetSum) { // Iterate through each target sum query
	if (canFormSum(0, targetSum)) { // Check if the current target sum can be formed
		console.log('yes');
	}
	else { // If not, output 'no'
		console.log('no');
	}
});

function canFormSum(currentIndex, targetSum) { // Recursive function to determine if a sum can be formed
	if (currentIndex >= countElements) { // Base case: If we've exhausted all elements
		return false; // Sum cannot be formed
	}

	if (elementArray[currentIndex] == targetSum) { // Base case: If the current element itself is the target sum
		return true; // Sum found
	}
	return canFormSum(currentIndex + 1, targetSum) || canFormSum(currentIndex + 1, targetSum - elementArray[currentIndex]); // Recursive calls: either skip current element or include it
}
