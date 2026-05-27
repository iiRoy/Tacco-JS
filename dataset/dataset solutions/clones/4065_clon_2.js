// This function serves to process an incoming data string.
function processInput(rawData) {
    // We split the provided raw string by spaces to obtain its constituent parts.
    let parts = rawData.split(" ");

    // The first segment is parsed into an integer, using base 10 for conversion.
    const firstNum = parseInt(parts[0], 10);
    // The second segment is similarly parsed into an integer, also with base 10.
    const secondNum = parseInt(parts[1], 10);

    // We then evaluate whether the product of these two numerical values is even or odd.
    // An even number yields a remainder of 0 when divided by 2.
    if ((firstNum * secondNum) % 2 === 0) {
        // If the outcome is an even number, we output the string "Even".
        console.log("Even");
    } else {
        // Otherwise, if the outcome is an odd number, we output the string "Odd".
        console.log("Odd");
    }
}

// The program initiates by reading the entire content from standard input,
// interpreting it as UTF-8 encoded text, and then passes this content
// to our primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
