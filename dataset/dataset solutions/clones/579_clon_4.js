const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const processInputPairs = (inputLines) => {
    const results = [];
    let lineCursor = 0;

    while (true) {
        if (lineCursor >= inputLines.length) {
            break;
        }
        const primarySequence = inputLines[lineCursor++].split('');
        
        // The original code would attempt to call .split("") on undefined if there's an odd number of lines.
        // This behavior is preserved by letting the next line potentially throw a TypeError.
        const secondarySequence = inputLines[lineCursor++].split('');

        const determineSegmentMatch = (sourceChars, targetChars, startOffset) => {
            let currentRun = 0;
            let peakRun = 0;
            const segmentLengthLimit = sourceChars.length - startOffset;

            for (let segmentIndex = 0; segmentIndex < segmentLengthLimit; segmentIndex++) {
                const sourceCharIndex = startOffset + segmentIndex;
                
                if (segmentIndex >= targetChars.length) {
                    // Target string exhausted, current run ends.
                    // This matches the original behavior where b[j] becomes undefined, causing a mismatch.
                    peakRun = Math.max(peakRun, currentRun);
                    currentRun = 0;
                    break; 
                }

                if (sourceChars[sourceCharIndex] === targetChars[segmentIndex]) {
                    currentRun++;
                } else {
                    // Mismatch, current run ends.
                    peakRun = Math.max(peakRun, currentRun);
                    currentRun = 0;
                }
            }
            // Crucially, if the loop finishes with a match, currentRun is NOT added to peakRun.
            // This replicates the original code's specific behavior.
            return peakRun;
        };

        // Generate an array of starting indices for the primary sequence, in reverse order
        // to match the original 'i' loop (a.length-1 down to 0).
        const allStartIndices = Array.from({ length: primarySequence.length }, (_, idx) => primarySequence.length - 1 - idx);

        // Use Array.prototype.reduce to iterate through all possible starting positions
        // and find the overall maximum match length.
        const overallMaximum = allStartIndices.reduce((currentOverallMax, currentStartIndex) => {
            const matchForThisStart = determineSegmentMatch(primarySequence, secondarySequence, currentStartIndex);
            return Math.max(currentOverallMax, matchForThisStart);
        }, 0);
        
        results.push(overallMaximum);
    }
    return results;
};

const finalOutputs = processInputPairs(lines);
finalOutputs.forEach(output => console.log(output));
