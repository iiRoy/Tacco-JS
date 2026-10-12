function sanitizePatternString(inputString) {
    return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processInput(rawDataString) {
    const lineSegments = rawDataString.split("\n");

    const targetPhrase = lineSegments.shift();
    const escapedTargetPhrase = sanitizePatternString(targetPhrase);

    const searchRegex = new RegExp(escapedTargetPhrase, 'g');

    const totalOccurrences = lineSegments.reduce((accumulator, currentTextLine) => {
        if (currentTextLine === "END_OF_TEXT") {
            return accumulator;
        }

        const lineMatches = Array.from(currentTextLine.matchAll(searchRegex));
        return accumulator + lineMatches.length;
    }, 0);

    console.log(totalOccurrences);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
