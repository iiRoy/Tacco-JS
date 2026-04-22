"use strict"; // This directive ensures strict mode for the entire script.

// This primary function is designed to handle and process the incoming input data.
const processInputData = (rawInputText) => {
    // First, remove any leading or trailing whitespace from the input string,
    // then split it into an array of strings based on newline characters.
    // The problem statement implies the first line holds the crucial numerical values.
    rawInputText = rawInputText.trim().split("\n");

    // Extract the total distance required for the journey from the first part of the initial line.
    const totalDistance = Number.parseInt(rawInputText[0].split(" ")[0]);

    // Retrieve the maximum permissible time for completing the journey from the second part of the line.
    const maximumTime = Number.parseInt(rawInputText[0].split(" ")[1]);

    // Obtain the constant travel speed from the third part of the input line.
    const currentSpeed = Number.parseInt(rawInputText[0].split(" ")[2]);

    // Evaluate if the time taken to cover the total distance at the given speed
    // is less than or equal to the maximum allowed time.
    // Output "Achievable" if it is, indicating success; otherwise, output "Unattainable".
    globalThis.console.log( (totalDistance / currentSpeed) <= maximumTime ? "Achievable" : "Unattainable" );
};

// Invoke the main data processing routine.
// The input is read synchronously from standard input using Node.js's file system module,
// and it's decoded as a UTF-8 string before being passed to the function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));