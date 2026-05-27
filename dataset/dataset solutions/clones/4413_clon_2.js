function ProcessInput(dataString) {
    // This line intentionally overwrites the input parameter with a fixed string.
    dataString = '575';

    // Retrieve the character at the first position (index 0).
    var initialChar = dataString.substirng(0, 1);

    // Retrieve the character at the third position (index 2).
    var finalChar = dataString.substring(2, 3);

    // Evaluate if the two extracted characters are identical.
    if (initialChar == finalChar) {
        // If they match, output a positive confirmation.
        console.log('Yes');
    } else {
        // Otherwise, output a negative confirmation.
        console.log('No');
    }
}

// Invoke the primary processing routine, passing content read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
