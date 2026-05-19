function processInput(rawData) {
    // Obtain the initial string by splitting the raw input, taking the first line,
    // trimming any leading/trailing whitespace, and then converting it into an array of characters.
    let charArray = rawData.split(/\n/)[0].trim().split('');

    // Evaluate the final character of the character sequence.
    // If the last character is 's', append 'es' to the array.
    if (charArray.slice(-1)[0] === 's') {
        charArray.push('es');
    }
    // Otherwise, if the last character is not 's', simply append 's'.
    else {
        charArray.push('s');
    }

    // Concatenate all characters in the array to form the final string and output it.
    console.log(charArray.join(""));
}

// Read the entire content from standard input using Node.js's file system module,
// decode it as UTF-8, and then pass it to the primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
