var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input into an array of lines

// Loop indefinitely until a specific condition is met
while (true) {
    // Parse the first line as a number and remove it from the array
    var currentVal = +dataRows.shift();

    // If the parsed number is 0, exit the loop
    if (currentVal === 0) {
        break;
    }

    // Process the next line: split by space, then convert each part to a number
    var scoreSet = dataRows.shift().split(' ').map(function(scoreItem) {
        return +scoreItem;
    });

    // Calculate the sum of all scores in the set
    var totalScore = scoreSet.reduce(function(accumulator, currentScore) {
        return accumulator + currentScore;
    });

    // Calculate the mean (average) of the scores
    var meanScore = totalScore / scoreSet.length;

    // Calculate the variance (average of the squared differences from the mean)
    var variance = scoreSet.reduce(function(sumOfSquaredDiffs, individualScore) {
        // Add the square of the difference between the current score and the mean
        return sumOfSquaredDiffs + Math.pow(individualScore - meanScore, 2);
    }, 0) / scoreSet.length; // Divide by the number of scores to get the average

    // Calculate the standard deviation (square root of the variance)
    // Then format it to 5 decimal places and print to console
    console.log(Math.sqrt(variance).toFixed(5));
}
