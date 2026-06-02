var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var processedText = rawData.trim();

// Split the text into an array of potential words using various delimiters
var filteredWords = processedText.split(/\s|\.|\,/);

// Filter the array to keep only words with lengths between 3 and 6 characters, inclusive
filteredWords = filteredWords.filter(function(currentWord) {
    return (currentWord.length >= 3 && currentWord.length <= 6);
});

// Output the filtered words joined by a single space
console.log(filteredWords.join(" "));
