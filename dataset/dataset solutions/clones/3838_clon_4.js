function Main(input) {
    const sourceText = input[0].toString();
    const targetIndex = parseInt(input[1]);
    const textLength = sourceText.length;

    if (textLength < 1 || 5000 < textLength) {
        process.exit();
    }

    if (targetIndex < 1 || 5 < targetIndex) {
        process.exit();
    }

    const allGeneratedSubstrings = Array.from({ length: textLength }, (_, startPosition) =>
        Array.from({ length: textLength - startPosition }, (_, segmentLength) =>
            sourceText.slice(startPosition, startPosition + segmentLength + 1)
        )
    ).flat();

    const uniqueFilteredSegments = Array.from(
        new Set(
            allGeneratedSubstrings.filter(currentSegment => !currentSegment.includes('\n'))
        )
    );

    uniqueFilteredSegments.sort();

    console.log(uniqueFilteredSegments[targetIndex - 1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
