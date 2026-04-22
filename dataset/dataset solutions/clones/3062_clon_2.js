"use strict"
;
// This script processes a collection of numerical inputs to check a specific condition.

const processInput = ( inputString ) => {
    // Divide the entire input text into distinct line segments.
    let lineSegments = inputString.split("\n")
    ;
    
    // Retrieve the maximum permissible value from the final segment, converting it to an integer.
    const maximumThreshold = parseInt( lineSegments.pop() )
    ;

    // Convert the initial five segments into an array of integer sensor measurements.
    const sensorMeasurements = lineSegments.slice(0,5).map( (measurementString) => parseInt(measurementString) )
    ;
    
    // Traverse through each individual sensor measurement.
    for ( let indexOne = 0; indexOne < sensorMeasurements.length; indexOne++ )
    {
        // For every current sensor, compare it against all subsequent sensors.
        for ( let indexTwo = indexOne + 1; indexTwo < sensorMeasurements.length; indexTwo++ )
        {
            // Verify if the numerical difference between the current pair of sensors surpasses the established threshold.
            if ( sensorMeasurements[indexTwo] - sensorMeasurements[indexOne] > maximumThreshold )
            {
                // If a difference exceeding the limit is identified, output a negative indicator and exit immediately.
                console.log(":-(")
                ;
                return
                ;
            }   
        }
    }
    
    // If no pairs of sensors violate the threshold, output a positive confirmation.
    console.log("Woohoo!")
    ;
}

// Obtain the necessary module for file system operations.
const fileSystemAccess = require('fs')
;

// Read the content from standard input in a blocking manner, interpret it as UTF-8, and then pass it to the primary processing function.
processInput( fileSystemAccess.readFileSync('/dev/stdin', 'utf8') )
;