"use strict";

const processComputationalTask = (inputData) => {
    const rawText = inputData.split("\n")[0];
    
    let activeStateMarker = false;
    const filteredSegments = [];
    
    for (const charUnit of rawText) {
        if (charUnit === "A") {
            activeStateMarker = true;
        }
        
        // Characters are added to filteredSegments only when activeStateMarker is true.
        // This captures the 'active' parts of the original string.
        if (activeStateMarker) {
            filteredSegments.push(charUnit);
        }
        
        if (charUnit === "Z") {
            activeStateMarker = false;
        }
    }
    
    const finalScores = [];
    let currentSegmentScore = 0;
    
    // Now, iterate through the filtered sequence to calculate the scores.
    // The score accumulates for each non-'Z' character in the filtered sequence.
    // When a 'Z' is encountered, the current accumulated score is recorded.
    for (const segmentUnit of filteredSegments) {
        if (segmentUnit === "Z") {
            finalScores.push(currentSegmentScore);
        } else {
            currentSegmentScore++;
        }
    }
    
    // Math.max(...[]) returns -Infinity if finalScores is empty.
    // Adding 1 to -Infinity results in -Infinity, matching the original behavior.
    const overallMaximum = Math.max(...finalScores);
    
    console.log(overallMaximum + 1);
};

processComputationalTask(require('fs').readFileSync('/dev/stdin', 'utf8'));