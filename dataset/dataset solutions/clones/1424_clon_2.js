function obtainInputLines() {
    // This function reads content from standard input.
    // It uses the Node.js 'fs' module to synchronously read the file.
    let rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // The content is then split into an array of lines,
    // handling both Unix-style (\n) and Windows-style (\r\n) line endings.
    return rawInputContent.split(/\n\r?/);
}

// The main execution block.
// It calls the input acquisition function, takes the first line,
// and processes each character within that line.
console.log(obtainInputLines()[0].split('').map(function(charElement) {
    // Checks if the current character is a lowercase letter.
    // If true, it converts the character to its uppercase equivalent.
    if (!!charElement.match(/[a-z]/)) {
        return charElement.toUpperCase();
    }
    // Otherwise, checks if the current character is an uppercase letter.
    // If true, it converts the character to its lowercase equivalent.
    else if (!!charElement.match(/[A-Z]/)) {
        return charElement.toLowerCase();
    }
    // If the character is neither a lowercase nor an uppercase letter,
    // it remains unchanged.
    else {
        return charElement;
    }
}).join('')); // Finally, all processed characters are joined back into a single string.
