"use strict";

/*
 * This JavaScript module calculates the straight-line distance between the
 * endpoints of two clock hands (or vectors) given their lengths and the time.
 * It leverages the Law of Cosines for the computation.
 */
const determineLength = (    rawData   ) => { // Primary function to execute the calculation process
    // Split the entire provided input string into an array of lines.
    const parsedSegments = rawData .  split(  '\n'  );

    // From the very first line of input, extract and parse the necessary numeric values.
    // 'segmentA' and 'segmentB' represent the individual lengths of the two arms.
    // 'timeHour' and 'timeMinute' specify the current time, influencing the angle.
    const [ segmentA, segmentB, timeHour, timeMinute ] = parsedSegments[0] . split(   ' '  ) . map(  ( numStr ) => parseInt(numStr, 10)  );

    // Compute the angular position of the first arm (hour hand) in degrees.
    // The hour hand moves 30 degrees per hour and an additional 0.5 degrees per minute.
    const firstArmRotation = timeHour * 30.0 + timeMinute * 0.5;

    // Calculate the angular position of the second arm (minute hand) in degrees.
    // The minute hand moves 6 degrees for every minute.
    const secondArmRotation = 6 * timeMinute;

    // Ascertain the angular separation between the two arms.
    // The precise angle value doesn't matter for Math.cos due to its periodic and even nature.
    const thetaAngle = firstArmRotation - secondArmRotation;

    // Apply the Law of Cosines to find the square of the distance between the arm tips.
    // Formula: c^2 = a^2 + b^2 - 2ab * cos(angle_between_a_and_b)
    const finalSquaredValue = segmentA * segmentA + segmentB * segmentB - 2 * segmentA * segmentB * Math.cos( Math.PI / 180 * thetaAngle );

    // Output the square root of the calculated squared distance, representing the actual distance.
    console.log( Math.sqrt( finalSquaredValue ) );
};

// Initiate the calculation by reading input from the standard input stream.
determineLength( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );