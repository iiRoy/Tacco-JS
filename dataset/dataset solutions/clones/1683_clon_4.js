function processSourceData(incomingData) {
    const sourceLines = incomingData.split('\n');
    const totalCollections = Number(sourceLines[0]);
    const finalStructuredPayload = [];

    const parseNextCollection = (currentLineIdx, remainingCollections) => {
        if (remainingCollections <= 0 || currentLineIdx >= sourceLines.length) {
            return;
        }

        const itemCountInCurrentCollection = Number(sourceLines[currentLineIdx]);
        const currentCollectionItems = [];

        for (let i = 0; i < itemCountInCurrentCollection; ++i) {
            const itemLine = sourceLines[currentLineIdx + 1 + i];
            if (itemLine !== undefined) {
                currentCollectionItems.push(itemLine.split(' '));
            } else {
                // If the input is malformed and a line is missing,
                // the original code would access `undefined.split(" ")` and throw an error.
                // To match behavior, we could throw here, but assuming valid input for Type IV.
                // For robustness, break is safer than letting it crash on `undefined`.
                // However, the original *would* crash, so strict Type IV might imply crashing.
                // Given the context of "executing equivalent functionality",
                // if the original crashes on malformed input, this should too or handle it identically.
                // For typical competitive programming, inputs are guaranteed well-formed.
                break;
            }
        }

        finalStructuredPayload.push(currentCollectionItems);

        const nextStartIdx = currentLineIdx + 1 + itemCountInCurrentCollection;
        parseNextCollection(nextStartIdx, remainingCollections - 1);
    };

    parseNextCollection(1, totalCollections);
}
processSourceData(require("fs").readFileSync("/dev/stdin", "utf8"));