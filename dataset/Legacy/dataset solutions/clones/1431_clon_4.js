function processInput(sourceData) {
    const lineSegments = sourceData.split("\n");

    const keyTerm = lineSegments.shift().toUpperCase();

    const terminatorPosition = lineSegments.findIndex(segment => segment.toUpperCase() === "END_OF_TEXT");

    const contentBlocks = terminatorPosition !== -1
        ? lineSegments.slice(0, terminatorPosition)
        : lineSegments;

    const finalCount = contentBlocks
        .flatMap(block => block.toUpperCase().split(/\s+/))
        .filter(currentSegment => currentSegment === keyTerm)
        .length;

    console.log(finalCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
