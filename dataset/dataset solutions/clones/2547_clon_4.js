"use strict";

const fileContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const contentLines = fileContent.split('\n');
const firstLineElements = contentLines[0].split(' ');
const initialValues = contentLines[1].split(' ');

const totalElements = parseInt(firstLineElements[0]);
const segmentSize = parseInt(firstLineElements[1]);

const distinctConfigurations = new Set();

// Generate a sequence of indices representing the starting points for the sliding window
Array.from({ length: initialValues.length - segmentSize + 1 }, (_, currentOffset) => {
    // Extract the portion of the array preceding the current window
    const leadingPart = initialValues.slice(0, currentOffset);

    // Isolate the window segment and sort its elements lexicographically
    // The original comparator (a,b)=>a>b for strings effectively performs a standard lexicographical sort.
    const sortableSegment = initialValues.slice(currentOffset, currentOffset + segmentSize).sort();

    // Obtain the portion of the array following the current window
    const trailingPart = initialValues.slice(currentOffset + segmentSize);

    // Construct the full sequence by combining the parts using spread syntax
    const transformedSequence = [...leadingPart, ...sortableSegment, ...trailingPart];

    // Add the comma-separated string representation of the sequence to the Set
    // This ensures only unique configurations are stored.
    distinctConfigurations.add(transformedSequence.join(','));
});

console.log(distinctConfigurations.size);
