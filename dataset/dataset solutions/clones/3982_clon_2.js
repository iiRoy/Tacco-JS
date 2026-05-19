function processInput(rawData) {
    // Split the entire input string by newline characters to get an array of individual lines.
    let parsedLines = rawData.split('\n');

    // Take the first line and split it into an array of characters.
    const firstLineChars = parsedLines[0].split('');

    // Take the second line and split it into an array of characters.
    const secondLineChars = parsedLines[1].split('');

    // Take the third line and split it into an array of characters.
    const thirdLineChars = parsedLines[2].split('');

    // Concatenate specific characters from each line and print the result to the console.
    // Specifically, the first character of the first line, the second character of the second line,
    // and the third character of the third line.
    console.log(firstLineChars[0] + secondLineChars[1] + thirdLineChars[2]);
}

// Read the entire content of the standard input file synchronously,
// using UTF-8 encoding, and then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
