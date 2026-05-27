function processData(dataString) {
    // Convert the incoming string data to an integer.
    dataString = parseInt(dataString, 10);

    // Output the result of subtracting the parsed integer from 48.
    console.log(48 - dataString);
}

// Read the content from standard input and pass it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
