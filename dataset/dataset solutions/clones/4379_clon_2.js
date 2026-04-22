"use strict"

// This routine processes textual information to extract specific characters.
function processString(incomingText)
{
    // Convert the input textual content into an array of individual characters.
    let characterArray = incomingText.split("");

    // Initialize an empty string to accumulate the final processed output.
    let finalOutput = "";

    // Loop through the character array, taking every second character starting from the beginning.
    // The loop iterates up to half the length of the array, rounded up.
    for ( let loopIndex = 0 ; loopIndex < Math.ceil(characterArray.length / 2) ; loopIndex ++ )
    {
        // Append the character at the current even index to our result string.
        finalOutput += characterArray[loopIndex * 2];
    }

    // Display the computed result to the standard output.
    console.log(finalOutput);
}

// Acquire input from the standard input stream (e.g., pipe or console)
// and then invoke the primary processing function with this data.
processString( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );