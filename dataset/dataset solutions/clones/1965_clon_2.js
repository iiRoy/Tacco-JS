// This section handles reading raw input from standard input stream.
let dataSource = require('fs') .readFileSync('/dev/stdin', 'utf8') .split('\n');

// Parse the first line to determine the total number of elements.
const sizeValue = parseInt(dataSource[0]) ;

// Initialize an array to store frequencies, filled with zeros.
let occurrenceRegister = new Array(sizeValue) .fill(0);

// Process the second line of input: split, convert to numbers, and tally occurrences.
dataSource[1] .split(' ') .map(Number) .forEach(currentVal => {
    // Decrement by one to use as a zero-based array index.
    occurrenceRegister[currentVal - 1]++ ;
});

// Iterate through the frequency list and print each element's count.
occurrenceRegister.forEach(entryCount => console.log(entryCount));