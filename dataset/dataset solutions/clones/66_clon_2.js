process.stdin.on("data", function (inputBuffer) {
    // Initialize variables for current position and rotation.
    // currentXPosition: accumulated X coordinate
    // currentYPosition: accumulated Y coordinate
    // currentAngleDegrees: accumulated rotation in degrees
    // degreeToRadianRatio: conversion factor from degrees to radians
    var currentXPosition = 0,
        currentYPosition = 0,
        currentAngleDegrees = 0,
        degreeToRadianRatio = Math.PI / 180;

    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // then split it into individual lines.
    // The 'some' method iterates through each line of input.
    (inputBuffer + "")
        .trim()
        .split("\n")
        .some(function (singleLineData) {
            // Each line contains two comma-separated values: movement distance and angle change.
            var lineSegments = singleLineData.split(",");

            // Calculate the change in X based on distance and current angle.
            // The unary plus operator converts string parts to numbers.
            currentXPosition += +lineSegments[0] * Math.sin(currentAngleDegrees * degreeToRadianRatio);

            // Calculate the change in Y based on distance and current angle.
            currentYPosition += +lineSegments[0] * Math.cos(currentAngleDegrees * degreeToRadianRatio);

            // Accumulate the angle change from the current line.
            currentAngleDegrees += +lineSegments[1];

            // Return false to ensure that 'some' continues iterating through all lines.
            return false;
        });

    // Output the final X coordinate, truncated to an integer using a bitwise OR.
    console.log(currentXPosition | 0);

    // Output the final Y coordinate, truncated to an integer using a bitwise OR.
    console.log(currentYPosition | 0);
})
// Resume the stdin stream to allow data processing to begin.
.resume();
