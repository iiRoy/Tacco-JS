function processCardGame(rawInputData) {
    const inputLines = rawInputData.split("\n");
    let currentLinePointer = 0;

    const extractNumbersFromLine = () => {
        const lineContent = inputLines[currentLinePointer];
        currentLinePointer++;
        return lineContent.split(" ").map(Number);
    };

    while (true) {
        const [deckSize, operationCount] = extractNumbersFromLine();

        if (deckSize === 0 && operationCount === 0) {
            break;
        }

        // Initialize the card collection: [undefined, deckSize, deckSize-1, ..., 1]
        // The 'undefined' at index 0 maintains 1-based indexing for the problem logic.
        let cardCollection = [undefined, ...Array.from({ length: deckSize }, (_, index) => deckSize - index)];

        for (let opIteration = 0; opIteration < operationCount; opIteration++) {
            const [startPosition, moveQuantity] = extractNumbersFromLine();

            // Deconstruct the card collection into three logical segments based on the operation:
            // 1. Cards preceding the 'startPosition'.
            // 2. The 'moveQuantity' cards starting from 'startPosition'.
            // 3. Cards remaining after the moved segment.

            const leadingCards = cardCollection.slice(1, startPosition);
            const cardsToRelocate = cardCollection.slice(startPosition, startPosition + moveQuantity);
            const trailingCards = cardCollection.slice(startPosition + moveQuantity);

            // Reconstruct the card collection by placing the relocated cards first,
            // followed by the leading cards, and then the trailing cards.
            cardCollection = [undefined, ...cardsToRelocate, ...leadingCards, ...trailingCards];
        }

        console.log(cardCollection[1]);
    }
}

processCardGame(require("fs").readFileSync("/dev/stdin", "utf8"));
