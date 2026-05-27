function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const sourceText = inputLines[0].toLowerCase();
    const targetK = parseInt(inputLines[1], 10);
    const textLength = sourceText.length;

    const isValidSubstring = (segment) => {
        return segment.length > 0 && !segment.includes('\n');
    };

    const collectedUniqueSubstrings = new Set();

    for (let startIdx = 0; startIdx <= textLength; startIdx++) {
        for (let endIdx = startIdx; endIdx <= textLength; endIdx++) {
            const currentSegment = sourceText.substring(startIdx, endIdx);
            if (isValidSubstring(currentSegment)) {
                collectedUniqueSubstrings.add(currentSegment);
            }
        }
    }

    const sortedSubstrings = Array.from(collectedUniqueSubstrings).sort();

    console.log(sortedSubstrings[targetK - 1]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
