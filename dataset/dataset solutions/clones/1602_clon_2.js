// This function processes the input to determine a final value based on a series of movements.
function ProcessJourney(rawInputData) {

    // First, clean and structure the incoming data.
    // Trim any leading/trailing whitespace, split into lines, and then split each line by space.
    let parsedCoordinates = rawInputData
                                        .trim()
                                        .split("\n")
                                        .map(
                                            // Callback function to split each line by space.
                                            // @param {string} currentElement - A single line of input.
                                            // @returns {string[]} An array of strings.
                                            function(currentElement)
                                                { return currentElement.split(" "); }
                                        );

    // Extract numerical parameters from the first line of the parsed data.
    // initialCoord represents the starting point.
    let initialCoord = Number.parseInt(parsedCoordinates[0][0], 10);
    // totalMoves represents the total number of steps to take.
    let totalMoves = Number.parseInt(parsedCoordinates[0][1], 10);
    // moveDistance represents the length of each step.
    let moveDistance = Number.parseInt(parsedCoordinates[0][2], 10);
    
    // Calculate the maximum number of steps one can take towards zero
    // without crossing it, given the current position and step distance.
    let maxMovesTowardsOrigin = Math.floor(Math.abs(initialCoord) / moveDistance);
    
    // This variable will store the absolute value of the final position.
    let finalMagnitude;

    // Check if the total steps are less than or equal to the steps needed to reach zero (or cross just slightly).
    if (totalMoves <= maxMovesTowardsOrigin)
    {
        // If so, all steps can be taken towards zero.
        // The final position's magnitude is the initial magnitude minus the total distance covered.
        finalMagnitude = Math.abs(initialCoord) - moveDistance * totalMoves;
    }
    else
    {
        // If total steps exceed 'maxMovesTowardsOrigin', we will cross zero.
        // First, move 'maxMovesTowardsOrigin' steps towards zero.
        let positionAfterZeroApproach = Math.abs(initialCoord) - moveDistance * maxMovesTowardsOrigin;
        
        // Calculate the remaining steps after approaching zero.
        let remainingSteps = totalMoves - maxMovesTowardsOrigin;

        // Determine the final position based on the parity of remaining steps.
        if ((remainingSteps % 2) === 0)
        {
            // If remaining steps are even, we end up on the same side of zero as 'positionAfterZeroApproach'.
            finalMagnitude = positionAfterZeroApproach;
        }
        else
        {
            // If remaining steps are odd, we end up on the opposite side of zero from 'positionAfterZeroApproach'.
            // This means we take one more step, essentially flipping the distance from zero relative to 'moveDistance'.
            finalMagnitude = moveDistance - positionAfterZeroApproach;
        }
    }

    // Output the calculated final magnitude to the console.
    console.log(finalMagnitude);

}


// Define the standard input file path.
const standardInputPath = "/dev/stdin";
// Define the character encoding for reading the file.
const encodingFormat = "utf8";

// Import the Node.js file system module.
const fileSystemHandler = require("fs");

// Read the entire content from the standard input file synchronously.
const fileContent = fileSystemHandler.readFileSync(standardInputPath, encodingFormat);

// Execute the main processing function with the obtained data.
ProcessJourney(fileContent);