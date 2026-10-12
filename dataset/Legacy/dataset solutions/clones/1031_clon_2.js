const settings = {
    sourcePath: '/dev/stdin', // Path to read input from
    lineSeparator: '\n' // Delimiter for splitting lines
};

// Read the entire file content, decode it, and split into lines.
const inputLines = require('fs').readFileSync(settings.sourcePath, 'utf-8').split(settings.lineSeparator);

const processingState = {
    areaSegments: [], // Stores processed area segments [start_index, area_value]
    indexStack: []    // Temporarily holds indices of '\' characters
};

// Process the first line of input character by character
const finalOutcome = inputLines[0].split('').reduce((accumulator, charItem, currentIndex) => {
    // If a backslash is encountered, push its index onto the stack.
    if (charItem === '\\') {
        accumulator.indexStack.push(currentIndex);
    }
    // If a forward slash is encountered and there's a backslash on the stack,
    // it indicates a potential area segment.
    else if (charItem === '/' && accumulator.indexStack.length > 0) {
        const startIndex = accumulator.indexStack.pop(); // Get the start index of the segment.

        // Filter existing area segments into two groups:
        // 1. Those starting at or after the current segment's start index.
        const higherSegments = accumulator.areaSegments.filter(segmentEntry => segmentEntry[0] >= startIndex);
        // 2. Those starting before the current segment's start index.
        const lowerSegments = accumulator.areaSegments.filter(segmentEntry => segmentEntry[0] < startIndex);

        // Calculate the area of the current segment, including any nested segments.
        const currentSegment = [
            startIndex,
            higherSegments.map(segmentEntry => segmentEntry[1]).reduce((total, val) => total + val, 0) + (currentIndex - startIndex)
        ];

        // Add the newly calculated segment to the lower segments.
        lowerSegments.push(currentSegment);
        // Update the main area segments list.
        accumulator.areaSegments = lowerSegments;
    }

    return accumulator; // Return the updated state for the next iteration.
}, processingState); // Initialize with the predefined processingState.

// Calculate the total area from all collected segments.
const totalArea = finalOutcome.areaSegments.reduce((total, segmentEntry) => total + segmentEntry[1], 0);
// Get the number of distinct area segments.
const segmentCount = finalOutcome.areaSegments.length;

// Output the total calculated area.
console.log(totalArea);
// Output the count of segments and their individual areas, if any exist.
console.log(`${segmentCount}${segmentCount > 0 ? ' ' + finalOutcome.areaSegments.map(segmentEntry => segmentEntry[1].toString()).join(' ') : ''}`);
