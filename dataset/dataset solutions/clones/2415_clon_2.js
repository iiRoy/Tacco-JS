"use strict";

const processInput = ( rawInput ) => {

    rawInput = rawInput
                 .trim()
                 .split( "\n" )
                 ;

    // Extracting grid dimensions and a special marker count from the first line
    const heightValue = parseInt( rawInput[0].split(" ")[0] );
    const widthValue  = parseInt( rawInput[0].split(" ")[1] );
    const keyCount    = parseInt( rawInput[0].split(" ")[2] );


    const charMatrix = rawInput
                        .slice(1, heightValue + 1)
                        .map( (lineData) => lineData.split("") )
                        ;

    // Initialize a 2D array to store the computed segment identifiers
    let outputGrid = Array.from({ length: heightValue });

    for (let rowIndex = 0; rowIndex < outputGrid.length; rowIndex++) {
      outputGrid[rowIndex] = new Array(widthValue).fill(0);
    }


    let segmentId = 1; // Current identifier for a contiguous region
    let markerDetected = false; // Flag to track if a '#' character was found in the current segment scan


    // Iterate through the matrix to assign segment IDs based on '#' occurrences
    for (let rowPosition = 0; rowPosition < heightValue; rowPosition++) {

        for (let colPosition = 0; colPosition < widthValue; colPosition++) {

            // If a marker is found and a previous marker was already processed in this row segment,
            // increment the segment ID
            if (charMatrix[rowPosition][colPosition] === "#" && markerDetected) {
                segmentId++;
                markerDetected = false; // Reset the detection flag
            }

            // If a marker is found, set the detection flag
            if (charMatrix[rowPosition][colPosition] === "#") {
                markerDetected = true;
            }

            outputGrid[rowPosition][colPosition] = segmentId; // Assign the current segment ID to the cell
        }
        segmentId++; // Increment segment ID after processing each row
        markerDetected = false; // Reset for the next row's processing
    }

    // Output the final processed grid, with each row on a new line
    console.log( outputGrid.join("\n") );
};

// Execute the main processing function with file system input from stdin
processInput( require('node:fs').readFileSync('/dev/stdin', 'utf8') );