function processInput(inputString) {
    // Parse the first numerical component from the input string.
    let firstVal = inputString.split(/\s+/g)[0];
    // Parse the second numerical component from the input string.
    let secondVal = inputString.split(/\s+/g)[1];
    // Parse the third numerical component from the input string.
    let thirdVal = inputString.split(/\s+/g)[2];

    // Initialize the angular measurement in radians.
    let angleRad = 0.0;

    // Evaluate a condition to determine the appropriate formula for angle calculation.
    if (thirdVal >= secondVal * (firstVal * firstVal) / 2) {
        // Apply the first trigonometric formula if the condition is met.
        angleRad = Math.atan(2 / firstVal * (secondVal - thirdVal / (firstVal * firstVal)));
    } else {
        // Otherwise, apply the alternative trigonometric formula.
        angleRad = Math.atan(firstVal * (secondVal * secondVal) / (2 * thirdVal));
    }

    // Convert the calculated angle from radians to degrees for the final output.
    const resultDeg = angleRad * (180 / Math.PI);

    // Display the final computed angle to the console.
    console.log(resultDeg);
}

// Read the entire content of standard input, then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
