// This function processes an array of input lines to compute a specific angle.
function ProcessInput(rawData) {
    // Split the first line of input by space to get individual string components.
    var parsedComponents = rawData[0].split(' ');
    
    // Assign the string components to descriptive variable names.
    // JavaScript's arithmetic operators will implicitly convert these strings to numbers.
    var dimensionA = parsedComponents[0];
    var dimensionB = parsedComponents[1];
    var targetVolume = parsedComponents[2];

    // Calculate the total volume of the container (assuming a square base of side 'a').
    var totalContainerVolume = dimensionA * dimensionA * dimensionB;
    
    // Determine which formula to use based on whether the target volume
    // is greater than or equal to half of the total container volume.
    if (targetVolume >= totalContainerVolume / 2) {
        // Scenario 1: The liquid fills more than half the container.
        // Calculate an effective height for the angle computation.
        var effectiveHeight = 2 * (dimensionB - (targetVolume / (dimensionA * dimensionA)));

        // Compute the angle in radians using the arctangent function.
        var angleInRadians = Math.atan(effectiveHeight / dimensionA);

        // Convert the angle from radians to degrees for the final output.
        var finalCalculatedAngle = (angleInRadians * 180) / Math.PI;
        
        // Print the result to the console.
        console.log("%s", finalCalculatedAngle);
    } else {
        // Scenario 2: The liquid fills less than half the container.
        // Calculate a different effective height for this scenario.
        var effectiveHeight = (2 * targetVolume) / (dimensionA * dimensionB);

        // Compute the angle in radians using the arctangent function.
        var angleInRadians = Math.atan(dimensionB / effectiveHeight);
       
        // Convert the angle from radians to degrees.
        var finalCalculatedAngle = (angleInRadians * 180) / Math.PI;
        
        // Print the result.
        console.log("%s", finalCalculatedAngle);
    }
}

// Read the entire content of standard input, decode it as UTF-8,
// split it into an array of strings by newline characters,
// and then pass this array to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
