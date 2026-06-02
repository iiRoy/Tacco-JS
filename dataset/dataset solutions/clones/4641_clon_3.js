process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to determine if three numbers form an arithmetic progression
function checkArithmeticProgression(valA, valB, valC) {
    // Calculate the difference between the first two values
    const diffAB = valB - valA;
    // Calculate the difference between the second and third values
    const diffBC = valC - valB;
    // Return true if the differences are equal, indicating an arithmetic progression
    return diffAB === diffBC;
}

process.stdin.on('data', function (inputBuffer) {
    const INPUT_DELIMITER = ' '; // Define a constant for the input separator
    const rawInputContent = inputBuffer.toString(); // Convert the input buffer to a string
    const stringComponents = rawInputContent.split(INPUT_DELIMITER); // Split the string by the delimiter

    // Parse the numeric values from the string components
    const firstNumericValue = Number(stringComponents[0]);
    const secondNumericValue = Number(stringComponents[1]);
    const thirdNumericValue = Number(stringComponents[2]);
    
    // Use the helper function to check if the parsed values form an arithmetic progression
    const isProgression = checkArithmeticProgression(
        firstNumericValue,
        secondNumericValue,
        thirdNumericValue
    );
    
    // Output "YES" or "NO" based on the result of the progression check
    if (isProgression) {
        console.log("YES");
    } else {
        console.log("NO");
    }
});
