'use strict'

// A placeholder for a very large numerical limit
const UNBOUNDED_VALUE = 900719925474099;

// Utility to convert a space-delimited string of numbers into an array of integers
function parseNumericSequence(txtLine) {
    return txtLine.split(' ').map(val => Number.parseInt(val, 10));
}

// Ensures modulo operation always returns a non-negative result
function adjustModulo(val, mod) {
    return ((val % mod) + mod) % mod;
}

// Performs a binary search on a sorted array to find the index of the first element
// that is greater than or equal to the specified target value.
function locateFirstGTE(orderedCollection, startIdx, endIdx, targetValue) {
    let lowerBound = startIdx; // inclusive
    let upperBound = endIdx; // exclusive
    while (1 < upperBound - lowerBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (orderedCollection[midPoint] < targetValue) {
            lowerBound = midPoint;
        } else {
            upperBound = midPoint;
        }
    }
    return orderedCollection[lowerBound] < targetValue ? upperBound : lowerBound;
}

// Computes the final position of a particle on a circular track
function calcFinalPosition(initialSpot, travelCourse, duration, circumference) {
    // travelCourse: 1 for clockwise, -1 for counter-clockwise
    const displacement = travelCourse * duration;
    return adjustModulo(initialSpot + displacement, circumference);
}

// Determines the net number of times a reference particle "passes" another particle
// in a clockwise direction due to collisions.
function assessPassage(refParticle, otherParticle, totalTime, trackLength) {
    let netCrossings = 0;

    // If particles move in the same direction, their relative order doesn't change due to collisions.
    if (refParticle.course === otherParticle.course) {
        return 0;
    }

    const refCurrentPos = refParticle.spot;
    const refCurrentDir = refParticle.course; // 1 for CW, -1 for CCW
    const otherCurrentPos = otherParticle.spot;
    const otherCurrentDir = otherParticle.course; // 1 for CW, -1 for CCW

    let timeToFirstMeeting;

    // Scenario 1: Reference is Clockwise, Other is Counter-Clockwise
    if (refCurrentDir === 1 && otherCurrentDir === -1) {
        if (refCurrentPos > otherCurrentPos) { // They are moving towards each other, other particle is "behind" ref in CW sense
            timeToFirstMeeting = (trackLength - refCurrentPos + otherCurrentPos) / 2;
        } else { // refCurrentPos < otherCurrentPos, they are moving away
            timeToFirstMeeting = (otherCurrentPos - refCurrentPos) / 2;
        }
        if (timeToFirstMeeting <= totalTime) {
            netCrossings++;
        }
        if (timeToFirstMeeting + trackLength / 2 <= totalTime) {
            netCrossings++;
        }
    }
    // Scenario 2: Reference is Counter-Clockwise, Other is Clockwise
    else if (refCurrentDir === -1 && otherCurrentDir === 1) {
        if (refCurrentPos < otherCurrentPos) { // They are moving towards each other, other particle is "ahead" of ref in CW sense
            timeToFirstMeeting = (otherCurrentPos - refCurrentPos) / 2;
        } else { // refCurrentPos > otherCurrentPos, they are moving away
            timeToFirstMeeting = (trackLength + refCurrentPos - otherCurrentPos) / 2;
        }
        if (timeToFirstMeeting <= totalTime) {
            netCrossings--; // Decrement for CCW reference passing CW
        }
        if (timeToFirstMeeting + trackLength / 2 <= totalTime) {
            netCrossings--;
        }
    }
    return netCrossings;
}

// Main simulation processing function
function ProcessSimulation(rawInputData) {
    const inputSegments = rawInputData.trim().split('\n');

    // Parse initial system parameters
    const [entityCount, trackCircumference, elapsedTimeRaw] = parseNumericSequence(inputSegments[0]);
    const normalizedElapsedTime = adjustModulo(elapsedTimeRaw, trackCircumference);

    // Populate initial particle data structures
    const initialParticles = [];
    for (let i = 0; i < entityCount; i++) {
        const [pos, dir] = parseNumericSequence(inputSegments[i + 1]);
        initialParticles.push({
            identifier: i,
            spot: pos,
            course: (dir === 1 ? 1 : -1) // Convert direction: 1 (CW) -> 1, 2 (CCW) -> -1
        });
    }

    const primaryEntity = initialParticles[0];
    let cumulativeDisplacementIndex = 0;

    // Calculate the total shift in output order due to collisions involving the first entity
    for (let k = 1; k < entityCount; k++) {
        cumulativeDisplacementIndex += assessPassage(primaryEntity, initialParticles[k], normalizedElapsedTime, trackCircumference);
    }
    cumulativeDisplacementIndex = adjustModulo(cumulativeDisplacementIndex, entityCount);

    // Determine the final positions for all particles
    const finalStates = initialParticles.map(p => ({
        finalSpot: calcFinalPosition(p.spot, p.course, normalizedElapsedTime, trackCircumference),
        originalIdentifier: p.identifier
    }));

    const primaryEntityFinalSpot = finalStates[0].finalSpot;

    // Sort the final positions (maintaining original identifier for clarity, though not strictly used by lower_bound)
    finalStates.sort((a, b) => a.finalSpot - b.finalSpot);

    // Extract only the final spots for the binary search
    const sortedFinalSpots = finalStates.map(p => p.finalSpot);

    // Find the position of the primary entity's final spot within the sorted list of final spots
    const primaryEntitySortedIndex = locateFirstGTE(sortedFinalSpots, 0, entityCount, primaryEntityFinalSpot);

    // Construct the final arrangement of positions based on collision shifts
    const finalArrangement = new Array(entityCount);
    let currentOutputCursor = cumulativeDisplacementIndex;
    let currentSortedCursor = primaryEntitySortedIndex;

    for (let i = 0; i < entityCount; i++) {
        finalArrangement[currentOutputCursor] = finalStates[currentSortedCursor].finalSpot;
        currentOutputCursor = (currentOutputCursor + 1) % entityCount;
        currentSortedCursor = (currentSortedCursor + 1) % entityCount;
    }

    console.log(finalArrangement.join('\n'));
}

ProcessSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));