"use strict";

const calculateLandingSpots = (sourceText) => {
    const symbols = sourceText.trim().split('');
    const symbolCount = symbols.length;

    const boundaryIndices = symbols.reduce((acc, currentSymbol, currentIdx, arr) => {
        if (currentSymbol === 'R' && arr[currentIdx + 1] === 'L') {
            acc.push(currentIdx);
        }
        return acc;
    }, []);

    const landingDestinations = symbols.map((currentSymbol, originalPosition) => {
        let finalSpot;
        if (currentSymbol === 'R') {
            // Find the nearest 'RL' boundary to the right (smallest pivot index >= current position)
            const pivotR = boundaryIndices.find(piv => piv >= originalPosition);
            const travelDistance = pivotR - originalPosition;
            finalSpot = (travelDistance & 1) === 0 ? pivotR : pivotR + 1;
        } else { // currentSymbol === 'L'
            // Find the nearest 'RL' boundary to the left (largest pivot index where (pivot + 1) <= current position)
            const pivotL = boundaryIndices.slice().reverse().find(piv => (piv + 1) <= originalPosition);
            const pivotLPlusOne = pivotL + 1;
            const travelDistance = originalPosition - pivotLPlusOne;
            finalSpot = (travelDistance & 1) === 0 ? pivotLPlusOne : pivotL;
        }
        return finalSpot;
    });

    const finalPopulation = landingDestinations.reduce((accumulator, destinationIndex) => {
        accumulator[destinationIndex]++;
        return accumulator;
    }, Array(symbolCount).fill(0));

    return finalPopulation.join(' ');
};

const processInput = (dataStream) => {
    console.log(calculateLandingSpots(dataStream));
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));