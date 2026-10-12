process.stdin.setEncoding('utf8'); // Set the character encoding for standard input

// Attach an event listener for the 'readable' event on standard input
process.stdin.on('readable', function() {
    // Attempt to read a chunk of data from the input stream
    let dataBlock = process.stdin.read();
    let linesOfInput; // Declare a variable to hold processed input lines

    // Check if a data chunk was successfully read (i.e., not null)
    if (dataBlock !== null) {
        // Split the received data block into an array of lines
        linesOfInput = dataBlock.split('\n');

        // If the last element of the array is an empty string, remove it
        // This often happens when input ends with a newline character
        if (linesOfInput[linesOfInput.length - 1] === '') {
            linesOfInput.pop();
        }

        // The first line contains the count value
        const countVal = linesOfInput[0];
        // The second line contains space-separated numbers, parse them into an array of integers
        const numArray = linesOfInput[1].split(' ').map(function(itemStr) {
            return parseInt(itemStr, 10); // Convert each string item to an integer
        });

        // Initialize two empty strings to build the output parts
        let firstPart = '';
        let secondPart = '';

        // Iterate through the numArray from right to left, skipping every other element
        for (let idx = countVal - 1; idx >= 0; idx -= 2) {
            // Append the current element to the first part string
            firstPart += numArray[idx] + ' ';
            // If the current index is not the first element,
            // prepend the previous element (idx-1) to the second part string
            if (idx !== 0) {
                secondPart = numArray[idx - 1] + ' ' + secondPart;
            }
        }

        // Output the concatenated first and second parts to the console
        console.log(firstPart + secondPart);
    }
});
