function ProcessInput(incomingData) {
    // Convert the incoming string into an array of individual characters.
    incomingData = incomingData.split('');

    // Determine the count of characters situated between the first and last.
    let middleCount = incomingData.length - 2;

    // Display the initial character, the calculated count, and the final character.
    console.log(incomingData[0] + middleCount + incomingData[incomingData.length - 1]);
}

// Read the content from standard input and pass it to our processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
