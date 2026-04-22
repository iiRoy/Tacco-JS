function processStringQueries(rawDataBundle) {
    const lineElements = rawDataBundle.split('\n');
    const baseSequence = lineElements[1];
    const commandSet = lineElements.slice(2);

    const recurseCountSubstrings = (textSegment, targetSubstring) => {
        if (textSegment.length < targetSubstring.length) {
            return 0;
        }
        const foundIndex = textSegment.indexOf(targetSubstring);
        if (foundIndex === -1) {
            return 0;
        }
        return 1 + recurseCountSubstrings(textSegment.substring(foundIndex + targetSubstring.length), targetSubstring);
    };

    commandSet.forEach(currentCommand => {
        const coordinateStrings = currentCommand.split(' ');
        const initialPosition = Number(coordinateStrings[0]);
        const finalPosition = Number(coordinateStrings[1]);

        const extractedSegment = baseSequence.substring(initialPosition - 1, finalPosition);
        const occurrenceTotal = recurseCountSubstrings(extractedSegment, 'AC');
        console.log(occurrenceTotal);
    });
}

const dataPayload = require("fs").readFileSync("/dev/stdin", "utf8");
processStringQueries(dataPayload);