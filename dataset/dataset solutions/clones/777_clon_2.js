/*
 * This JavaScript module handles input stream processing.
 * Its purpose is to decode sequences of numbers into textual messages,
 * mimicking a traditional mobile phone keypad input method.
 */

// Initialize the standard input stream to ensure it remains active
process.stdin.resume();

// Configure the encoding for the incoming data to UTF-8
process.stdin.setEncoding( "utf8" );

// Attach an event listener to the standard input stream for 'data' events.
// This function will execute whenever a chunk of data is received.
process.stdin.on ( "data", function ( inputBuffer ) {

    // Process the raw incoming data block:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the entire block into an array of individual lines.
    var parsedLines = inputBuffer.trim ( ) .split ( "\n" );

    // The initial line in the input specifies the total number of message sequences to decode.
    // This line is extracted from the `parsedLines` array.
    var messageCount = parsedLines.shift ( );

    // Define the character mappings for a T9-style keypad.
    // Each array index corresponds to a digit (0-9), and its value is a string of characters.
    var keypadDigits = [
        "",           // Index 0: No characters
        ".,!? ",      // Index 1
        "abc",        // Index 2
        "def",        // Index 3
        "ghi",        // Index 4
        "jkl",        // Index 5
        "mno",        // Index 6
        "pqrs",       // Index 7
        "tuv",        // Index 8
        "wxyz"        // Index 9
    ];

    // Transform the `keypadDigits` array:
    // Each string of characters is split into an array of single characters,
    // making it easier to access individual characters by index.
    keypadDigits = keypadDigits.map( function ( digitString ) {
        return digitString.split( "" );
    } );

    // Iterate through each message sequence as indicated by `messageCount`.
    for ( var messageIdx = 0; messageIdx < messageCount; messageIdx++ ) {

        // For the current message sequence:
        // 1. Get the string from `parsedLines`.
        // 2. Split it into individual digit characters.
        // 3. Convert each character to its numeric representation.
        var numericSequence = parsedLines[ messageIdx ].split( "" ).map( Number );

        // Initialize variables for decoding the current message.
        var outputMessage = "";       // This will accumulate the final decoded text.
        var currentCharacter = "";    // Stores the character currently being selected by presses.
        var tapCounter = 0;           // Tracks consecutive taps on the same digit key.

        // Process each digit value within the `numericSequence`.
        numericSequence.forEach( function ( currentDigitValue ) {

            // If the digit is greater than zero, it signifies a key press.
            if ( currentDigitValue > 0 ) {
                // Determine the character based on the digit and the number of taps.
                // The modulo operator ensures cycling through available characters for that digit.
                currentCharacter = keypadDigits[ currentDigitValue ][ tapCounter % keypadDigits[ currentDigitValue ].length ];
                tapCounter++; // Increment the tap counter for the ongoing sequence of presses.
            } else {
                // A zero digit acts as a delimiter or confirmation for the current character.
                // Append the `currentCharacter` to the `outputMessage`.
                outputMessage += currentCharacter;

                // Reset `currentCharacter` and `tapCounter` for the next character sequence.
                currentCharacter = "";
                tapCounter = 0;
            }
        } );

        // Once the entire numeric sequence is processed, print the decoded message.
        console.log( outputMessage );
    }
} );