'use strict';
((inputResource) => {
    const numericComponents = inputResource.trim().split(/\s+/).map(Number);

    const resultingDimension = numericComponents.reduce((accumulatedMeasurement, currentMagnitude, iterationIndex) => {
        if (iterationIndex === 0) {
            return currentMagnitude;
        } else {
            return accumulatedMeasurement - (currentMagnitude + currentMagnitude);
        }
    });

    console.log(Math.max(0, resultingDimension));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));