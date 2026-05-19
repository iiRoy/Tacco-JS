"use strict"

const acquireSourceMaterial = () => require('fs').readFileSync('/dev/stdin', 'UTF-8');

const isolateFirstDatum = (fullContent) => {
    const newlineBoundary = fullContent.indexOf('\n');
    return (newlineBoundary === -1) ? fullContent : fullContent.substring(0, newlineBoundary);
};

const computeCubicMagnitude = (textualRepresentation) => {
    const numericalValue = Number(textualRepresentation);
    return Math.pow(numericalValue, 3);
};

console.log(
    computeCubicMagnitude(
        isolateFirstDatum(
            acquireSourceMaterial()
        )
    )
);
