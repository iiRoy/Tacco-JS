// This script conducts a pattern validation process on incoming text.
function ProcessRawInput( rawInputText ) {
    // The input content is fragmented into distinct lines.
    var textLines = rawInputText.split('\n');

    // Iterate through each character of the initial line in the provided data.
    for (  var charPosition = 0;  charPosition < textLines[0].length;  charPosition++  ) {

        // Obtain the character at the present index.
        var currentCharacter = textLines[0].substr(charPosition, 1);

        // Analyze characters based on their sequential position (even or odd).
        if  (  charPosition % 2 == 0  )  {
            // For characters at even indices, a specific symbol implies an invalid sequence.
            if  (  currentCharacter == "Right"  )  {
                console.log("Failure");
                return;
            }
        }  else  {
            // For characters at odd indices, a different symbol indicates an invalid sequence.
            if  (  currentCharacter == "Left"  )  {
                console.log("Failure");
                return;
            }
        }
    }

    // If no invalid patterns are detected throughout the entire scan, the sequence is deemed valid.
    console.log("Success");
    return;
}

// Do not alter the following section; it manages the standard I/O mechanism and activates the primary function.
ProcessRawInput(require("node:fs").readFileSync("/app_data/input_source.txt", "utf-8"));