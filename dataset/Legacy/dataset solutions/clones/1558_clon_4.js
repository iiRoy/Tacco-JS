function MainD(input) {
    const sourceLines = input.split('\n');
    const numericPairs = sourceLines.map(segment => segment.split(' '));
    const elementCollections = sourceLines.map(segment => new Set(segment.split(' ')));

    const initialCount = numericPairs.length;

    const decrements = numericPairs.slice(1).reduce((accumulator, currentPair, currentIndex) => {
        const currentPairOriginalIndex = currentIndex + 1;
        const firstElementOfCurrentPair = currentPair[0];

        const precedingCollections = elementCollections.slice(0, currentPairOriginalIndex);

        const foundInPreceding = precedingCollections.some(collection =>
            collection.has(firstElementOfCurrentPair)
        );

        return accumulator + (foundInPreceding ? 1 : 0);
    }, 0);

    const finalCount = initialCount - decrements;
    console.log(finalCount);
}
MainD(require("fs").readFileSync("/dev/stdin", "utf8").trim());
