'use strict';

const fs = require("fs");
const raw = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);
let cursor = 0;

const antCount = raw[cursor++];
const trackLength = raw[cursor++];
const elapsedTime = raw[cursor++];

const ants = [];
for (let i = 0; i < antCount; i++) {
    const position = raw[cursor++];
    const direction = raw[cursor++] === 1 ? 1 : -1;
    ants.push({ position, direction });
}

function normalizePosition(value, mod) {
    return ((value % mod) + mod) % mod;
}

function lowerBound(sortedValues, target) {
    let left = 0;
    let right = sortedValues.length;

    while (left < right) {
        const middle = Math.floor((left + right) / 2);

        if (sortedValues[middle] < target) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    return left;
}

function upperBound(sortedValues, target) {
    let left = 0;
    let right = sortedValues.length;

    while (left < right) {
        const middle = Math.floor((left + right) / 2);

        if (sortedValues[middle] <= target) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    return left;
}

function rotateArray(values, shift) {
    const size = values.length;
    const start = ((shift % size) + size) % size;
    return values.slice(start).concat(values.slice(0, start));
}

const firstAnt = ants[0];
const finalPositions = ants.map(ant => {
    return normalizePosition(ant.position + ant.direction * (elapsedTime % trackLength), trackLength);
});

let crossingOffset = 0;

for (let i = 1; i < antCount; i++) {
    const currentAnt = ants[i];

    if (currentAnt.direction === firstAnt.direction) {
        continue;
    }

    const distanceFromFirstView = normalizePosition(
        firstAnt.direction * (currentAnt.position - firstAnt.position),
        trackLength
    );

    const crossings = 1 + Math.trunc((2 * elapsedTime - distanceFromFirstView) / trackLength);
    crossingOffset = (crossingOffset + crossings) % antCount;
}

const sortedFinalPositions = finalPositions.slice().sort((a, b) => a - b);
const firstFinalPosition = finalPositions[0];

const firstFinalIndex = firstAnt.direction === 1
    ? upperBound(sortedFinalPositions, firstFinalPosition) - 1
    : lowerBound(sortedFinalPositions, firstFinalPosition);

const finalLabelIndex = normalizePosition(firstAnt.direction * crossingOffset, antCount);
const answer = rotateArray(sortedFinalPositions, firstFinalIndex - finalLabelIndex);

console.log(answer.join("\n"));