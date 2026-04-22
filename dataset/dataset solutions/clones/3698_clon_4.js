"use strict";

function calculateNumericSpan(sourcePayload) {
    let contentLines = sourcePayload.split('\n');
    let targetDataLine = contentLines[1];

    let currentMaximum = -Infinity;
    let currentMinimum = Infinity;
    let currentSegment = "";
    let isInitialValue = true;

    const updateExtremes = (val) => {
        if (isInitialValue) {
            currentMaximum = val;
            currentMinimum = val;
            isInitialValue = false;
        } else {
            if (val > currentMaximum) currentMaximum = val;
            if (val < currentMinimum) currentMinimum = val;
        }
    };

    for (let charUnit of targetDataLine) {
        if (charUnit === ' ') {
            let processedValue;
            if (currentSegment === "") {
                processedValue = 0;
            } else {
                processedValue = parseInt(currentSegment, 10);
            }
            updateExtremes(processedValue);
            currentSegment = "";
        } else {
            currentSegment += charUnit;
        }
    }
    
    let finalProcessedValue;
    if (currentSegment === "") {
        finalProcessedValue = 0;
    } else {
        finalProcessedValue = parseInt(currentSegment, 10);
    }
    updateExtremes(finalProcessedValue);

    console.log(currentMaximum - currentMinimum);
}

calculateNumericSpan(require('fs').readFileSync('/dev/stdin', 'utf8'));