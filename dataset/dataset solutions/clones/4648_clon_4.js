const processRawData = (sourceData) => {
    const textSegments = sourceData.split('\n');
    const segmentA = textSegments[0];
    const segmentB = textSegments[1];

    let cursorA = 0;
    let cursorB = 0;

    const totalOutputElements = segmentA.length + segmentB.length;

    // Create an array of numbers representing the sequence of sources to pick from (0 for A, 1 for B).
    const sourceSelectionOrder = Array.from({ length: totalOutputElements }, (_, elementIndex) => elementIndex % 2);

    // Use a functional approach (reduce) to build the output array.
    const collectedOutput = sourceSelectionOrder.reduce((accumulator, currentSelector) => {
        let characterToInclude;
        if (currentSelector === 0) { // Pick from segmentA
            characterToInclude = segmentA[cursorA];
            cursorA++;
        } else { // Pick from segmentB
            characterToInclude = segmentB[cursorB];
            cursorB++;
        }
        accumulator.push(characterToInclude);
        return accumulator;
    }, []);

    // Join all collected characters with newlines. `undefined` elements will be converted to "undefined" strings.
    return collectedOutput.join('\n');
};

console.log(processRawData(require("fs").readFileSync("/dev/stdin", "utf8")));