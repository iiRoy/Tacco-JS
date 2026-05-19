function getInputData() {
    // This function reads content from standard input.
    let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // It then splits the content into an array of strings, using newline characters as delimiters.
    return fileContent.split(/\n\r?/);
}

// Obtain all lines from the input source.
let inputLines = getInputData();

// The very first line of input is designated as the word we are searching for.
const targetWord = inputLines[0];

// All subsequent lines form the body of text where the search will be conducted.
let textLines = inputLines.slice(1);

// Iterate through each line of the text body and count occurrences of the target word.
console.log(textLines.reduce(function(totalCount, currentLine) {
    // Break down the current line into an array of individual words.
    currentLine = currentLine.split(' ');

    // Continuously search for and count the target word within the current line's words.
    while (currentLine.indexOf(targetWord) + 1) {
        totalCount++; // Increment the counter for each found instance.
        // Remove the found word to ensure that multiple occurrences at the same index are not missed
        // if the word appears consecutively (e.g., "word word").
        currentLine.splice(currentLine.indexOf(targetWord), 1);
    }
    return totalCount; // Pass the updated count to the next iteration of the reducer.
}, 0)); // Initialize the overall count of the target word to zero.
