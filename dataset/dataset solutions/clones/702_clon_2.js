var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Process the raw input: split by newline and convert each part to a number.
var numericEntries = rawData.split('\n').map(function(itemStr) {
    return +itemStr;
});

var currentValue; // Variable to hold the current number of scores to process
while (currentValue = numericEntries.shift()) {
    // If the current value is zero, it signifies the end of input.
    if (currentValue === 0) {
        break;
    }

    // Initialize an array to store the scores for the current set.
    var scoreList = [];
    // Read 'currentValue' number of scores from the input.
    for (var idx = 0; idx < currentValue; idx++) {
        scoreList.push(numericEntries.shift());
    }

    // Sort the scores in ascending order.
    scoreList.sort(function(valA, valB) {
        return valA - valB;
    });

    // Remove the lowest score.
    scoreList.shift();
    // Remove the highest score.
    scoreList.pop();

    // Calculate the sum of the remaining scores.
    var totalScore = scoreList.reduce(function(accumulator, currentNum) {
        return accumulator + currentNum;
    });

    // Calculate the average of the remaining scores and print its floor.
    console.log(Math.floor(totalScore / scoreList.length));
}
