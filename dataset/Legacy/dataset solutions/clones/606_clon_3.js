const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const rawInputData = fileSystemModule.readFileSync(standardInputPath, textEncoding);
let processedInputString = rawInputData.trim();

let overallMaximumLength = 0;

const joiPattern = /(J+)(O+)(I+)/g;

// Iterate through all matches found in the processed string
// This approach replaces the side-effecting callback of String.prototype.replace
const foundMatchesIterator = processedInputString.matchAll(joiPattern);

for (const currentMatchEntry of foundMatchesIterator) {
    // currentMatchEntry[0] holds the entire matched substring (e.g., "JJJOOOIII")
    // currentMatchEntry[1] holds the 'J' sequence (first capturing group)
    // currentMatchEntry[2] holds the 'O' sequence (second capturing group)
    // currentMatchEntry[3] holds the 'I' sequence (third capturing group)

    const jSequenceSegment = currentMatchEntry[1];
    const oSequenceSegment = currentMatchEntry[2];
    const iSequenceSegment = currentMatchEntry[3];

    const jSegmentLength = jSequenceSegment.length;
    const oSegmentLength = oSequenceSegment.length;
    const iSegmentLength = iSequenceSegment.length;

    let candidateLength = 0; // Represents the 'min' value from the original logic

    // Check if the conditions for a valid JOI sequence are met
    const meetsLengthCriteria = (jSegmentLength >= oSegmentLength) && (iSegmentLength >= oSegmentLength);

    if (meetsLengthCriteria) {
        candidateLength = oSegmentLength; // If criteria met, the length is determined by the 'O' sequence
    }
    // If criteria are not met, candidateLength remains 0, which is correctly handled by Math.max

    // Update the overall maximum length found across all valid sequences
    overallMaximumLength = Math.max(overallMaximumLength, candidateLength);
}

console.log(overallMaximumLength);
