process.stdin.setEncoding('utf-8'); // Configure standard input to use UTF-8 encoding.

process.stdin.on('data', function (receivedInput) {
    // Process the incoming data: first, remove any newline characters, then split the string by spaces.
    let scoreComponents = receivedInput.replace(/\r?\n/g, "").split(" ");

    // Check for a specific termination sequence: if all three input parts are -1, exit the program.
    if (parseInt(scoreComponents[0]) === -1 && parseInt(scoreComponents[1]) === -1 && parseInt(scoreComponents[2]) === -1) {
        process.exit(); // Terminate the Node.js process.
    }

    // Calculate the overall score by summing the first two components.
    // If a component is -1, it is treated as 0 for the sum.
    let overallScore = (parseInt(scoreComponents[0]) === -1 ? 0 : parseInt(scoreComponents[0])) +
                       (parseInt(scoreComponents[1]) === -1 ? 0 : parseInt(scoreComponents[1]));

    // Determine and print the corresponding grade based on the calculated overall score.
    if (overallScore >= 80) {
        console.log("A"); // Output 'A' for scores 80 and above.
    } else if (overallScore >= 65) {
        console.log("B"); // Output 'B' for scores between 65 and 79.
    } else if (overallScore >= 50) {
        console.log("C"); // Output 'C' for scores between 50 and 64.
    } else if (overallScore >= 30) {
        // For scores between 30 and 49, an additional check on the third component is performed.
        if (parseInt(scoreComponents[2]) >= 50) {
            console.log("C"); // Output 'C' if the third component is 50 or higher.
        } else {
            console.log("D"); // Otherwise, output 'D'.
        }
    } else {
        console.log("F"); // Output 'F' for any score below 30.
    }
});
