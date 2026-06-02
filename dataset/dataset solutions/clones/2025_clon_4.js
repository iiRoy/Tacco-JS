"use strict";

const processData = (rawInput) => {
    const [firstLineContent, secondLineContent] = rawInput.trim().split('\n');
    const [totalLength, numPoints] = firstLineContent.split(' ').map(Number);
    const pointPositions = secondLineContent.split(' ').map(Number);

    const segmentSpans = pointPositions.reduce((accumulatedSpans, currentPosition, index, allPositions) => {
        let spanValue;
        if (index === allPositions.length - 1) {
            // For the last point, calculate the distance back to the first point,
            // considering the circular nature of the track (totalLength).
            spanValue = totalLength - currentPosition + allPositions[0];
        } else {
            // For other points, calculate the distance to the next point in sequence.
            spanValue = allPositions[index + 1] - currentPosition;
        }
        accumulatedSpans.push(spanValue);
        return accumulatedSpans;
    }, []);

    // To find the minimum travel distance to visit all points,
    // we subtract the longest segment from the total length of the track.
    const maximumSpan = Math.max(...segmentSpans);
    const shortestCircuit = totalLength - maximumSpan;

    console.log(shortestCircuit);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
