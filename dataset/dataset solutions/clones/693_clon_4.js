function processGameData(rawData) {
    const allNumbers = rawData.match(/\d+/g).map(Number);
    let dataCursor = 0;

    while (true) {
        const totalCards = allNumbers[dataCursor++];
        const numOperations = allNumbers[dataCursor++];

        if (totalCards === 0 && numOperations === 0) {
            break;
        }

        let currentDeck = Array.from({ length: totalCards }, (_, i) => totalCards - i);

        for (let opIdx = 0; opIdx < numOperations; opIdx++) {
            const cutPosition = allNumbers[dataCursor++];
            const moveCount = allNumbers[dataCursor++];

            const firstPartEndIndex = cutPosition - 1;

            const segmentA = currentDeck.slice(0, firstPartEndIndex);
            const segmentB = currentDeck.slice(firstPartEndIndex, firstPartEndIndex + moveCount);
            const segmentC = currentDeck.slice(firstPartEndIndex + moveCount);

            currentDeck = [...segmentB, ...segmentA, ...segmentC];
        }
        console.log(currentDeck[0]);
    }
}
processGameData(require("fs").readFileSync("/dev/stdin","utf8"));