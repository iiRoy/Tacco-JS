const processSequence = (inputNumbers) => {
    // To replicate the original loop's behavior of comparing H[i] with H[i+1]
    // for i from 0 up to H.length, we extend the array with a single undefined value.
    // This allows the reduce method to iterate H.length + 1 times,
    // where the last iteration compares 'undefined' with 'undefined'.
    const extendedInput = [...inputNumbers, undefined];

    const finalAccumulator = extendedInput.reduce((state, currentElement, index, fullArray) => {
        const nextElement = fullArray[index + 1];

        if (currentElement >= nextElement) {
            // Continue the current non-increasing segment
            state.currentSegmentLength++;
        } else {
            // Segment ends, record its length and reset for the next segment
            state.segmentLengths.push(state.currentSegmentLength);
            state.currentSegmentLength = 0;
        }
        return state;
    }, { currentSegmentLength: 0, segmentLengths: [] });

    return finalAccumulator.segmentLengths;
};

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const numericValues = sourceData[1].split(" ").map(val => Number(val));
console.log(Math.max(...processSequence(numericValues)));
