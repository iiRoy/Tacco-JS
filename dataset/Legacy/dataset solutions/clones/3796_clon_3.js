const processInput = function(rawData) {
    const EAST_CHAR_IDENTIFIER = 'E';
    const WEST_CHAR_IDENTIFIER = 'W';
    const INITIAL_MAX_FLIP_COUNT = 3 * Math.pow(10, 5);

    const inputLines = rawData.split("\n");
    const targetSequence = inputLines[1];
    const sequenceLength = targetSequence.length;

    let minimumFlipsRequired = INITIAL_MAX_FLIP_COUNT;

    for (let pivotPosition = 0; pivotPosition < sequenceLength; pivotPosition++) {
        let currentIterationFlipCount = 0;

        // Calculate flips for the segment to the left of the pivot
        for (let charIndexLeft = 0; charIndexLeft < pivotPosition; charIndexLeft++) {
            if (targetSequence[charIndexLeft] !== EAST_CHAR_IDENTIFIER) {
                currentIterationFlipCount++;
            }
        }

        // Calculate flips for the segment to the right of the pivot
        for (let charIndexRight = pivotPosition + 1; charIndexRight < sequenceLength; charIndexRight++) {
            if (targetSequence[charIndexRight] !== WEST_CHAR_IDENTIFIER) {
                currentIterationFlipCount++;
            }
        }
       
        minimumFlipsRequired = Math.min(minimumFlipsRequired, currentIterationFlipCount);
    }
    console.log(minimumFlipsRequired);
};

const readInputSource = (sourcePath) => {
    return require('fs').readFileSync(sourcePath, 'UTF-8');
};

processInput(readInputSource('/dev/stdin'));
