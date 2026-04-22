"use strict";
const dataFeedHandler = (sourceText) => {
    let internalTokens = sourceText.split(/\s|\n/).filter(token => token.length > 0);
    let tokenPointer = 0;

    const obtainNumber = () => {
        if (tokenPointer >= internalTokens.length) {
            throw new Error("Insufficient data for number extraction.");
        }
        return parseInt(internalTokens[tokenPointer++], 10);
    };

    const obtainNumberSequence = (count) => {
        if (count < 1) throw new Error('Count must be 1 or more for number sequence.');
        let sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(obtainNumber());
        }
        return sequence;
    };

    const obtainText = () => {
        if (tokenPointer >= internalTokens.length) {
            throw new Error("Insufficient data for text extraction.");
        }
        return internalTokens[tokenPointer++];
    };

    const obtainTextSequence = (count) => {
        if (count < 1) throw new Error('Count must be 1 or more for text sequence.');
        let sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(obtainText());
        }
        return sequence;
    };

    return {
        fetchNumeric: obtainNumber,
        fetchNumericList: obtainNumberSequence,
        fetchText: obtainText,
        fetchTextList: obtainTextSequence,
    };
};

const determineOptimalPairings = (rawData) => {
    const dataSource = dataFeedHandler(rawData);
    const itemQuantity = dataSource.fetchNumeric();

    const groupAItems = [];
    const groupBItems = [];

    for (let i = 0; i < itemQuantity; i++) {
        groupAItems.push({ xPos: dataSource.fetchNumeric(), yPos: dataSource.fetchNumeric() });
    }
    for (let i = 0; i < itemQuantity; i++) {
        groupBItems.push({ xPos: dataSource.fetchNumeric(), yPos: dataSource.fetchNumeric() });
    }

    groupBItems.sort((p1, p2) => p1.xPos === p2.xPos ? p1.yPos - p2.yPos : p1.xPos - p2.xPos);
    groupAItems.sort((p1, p2) => p1.xPos === p2.xPos ? p1.yPos - p2.yPos : p1.xPos - p2.xPos);

    let successfulLinkages = 0;
    let availableGroupA = [];
    let groupACursor = 0;

    for (const currentGroupB of groupBItems) {
        while (groupACursor < groupAItems.length && groupAItems[groupACursor].xPos < currentGroupB.xPos) {
            availableGroupA.push(groupAItems[groupACursor]);
            groupACursor++;
        }

        let bestCandidateIndex = -1;
        let highestYValue = -Infinity;

        for (let i = 0; i < availableGroupA.length; i++) {
            const potentialGroupA = availableGroupA[i];
            if (potentialGroupA.yPos < currentGroupB.yPos) {
                if (potentialGroupA.yPos > highestYValue) {
                    highestYValue = potentialGroupA.yPos;
                    bestCandidateIndex = i;
                }
            }
        }

        if (bestCandidateIndex !== -1) {
            successfulLinkages++;
            availableGroupA.splice(bestCandidateIndex, 1);
        }
    }

    console.log(successfulLinkages);
};

if (typeof window === "undefined") {
    determineOptimalPairings(require("fs").readFileSync("/dev/stdin", "utf8"));
} else {
    // For browser or alternative environments, if needed
    // determineOptimalPairings(window.inputStringForTesting);
}