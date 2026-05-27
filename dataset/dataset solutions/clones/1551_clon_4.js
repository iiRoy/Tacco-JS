function Main(input) {
    const inputLines = input.split("\n");
    const sourceText = inputLines[0];
    const targetText = inputLines[1];

    if (targetText.length === 0) {
        return console.log(0);
    }

    const sourceChars = [...sourceText];
    const targetChars = [...targetText];
    const targetLength = targetChars.length;
    const sourceLength = sourceChars.length;

    let leastMismatchCount = targetLength;

    if (sourceLength >= targetLength) {
        const possibleStartIndices = Array.from({ length: sourceLength - targetLength + 1 }, (_, idx) => idx);

        const allMismatchCounts = possibleStartIndices.map(currentStartIndex => {
            const currentSourceSegment = sourceChars.slice(currentStartIndex, currentStartIndex + targetLength);

            const segmentMismatchCount = currentSourceSegment.reduce((accumulator, charFromSource, charPosition) => {
                return accumulator + (charFromSource !== targetChars[charPosition] ? 1 : 0);
            }, 0);

            return segmentMismatchCount;
        });

        leastMismatchCount = Math.min(...allMismatchCounts);
    }

    console.log(leastMismatchCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
