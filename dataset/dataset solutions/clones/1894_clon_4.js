function processData(entireContent) {
    const lineSegments = entireContent.split('\n');

    const headCount = parseInt(lineSegments[0].split(' ')[0], 10);

    const collectedItems = lineSegments.flatMap((textLine, position) => {
        if (position >= 2 && position % 2 === 0) {
            return textLine.split(' ');
        }
        return [];
    });

    const distinctElementCount = new Set(collectedItems).size;

    return headCount - distinctElementCount;
}