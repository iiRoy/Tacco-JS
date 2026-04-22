const pokerEvaluator = (inputSource) => {
    const handResultLabels = {
        FOUR_OF_A_KIND: "four card",
        FULL_HOUSE: "full house",
        THREE_OF_A_KIND: "three card",
        TWO_PAIR: "two pair",
        ONE_PAIR: "one pair",
        STRAIGHT: "straight",
        NO_HAND: "null"
    };

    const processSingleHand = (handRecord) => {
        const numeralRanks = handRecord.split(',').map(Number);
        const ranksInOrder = numeralRanks.slice().sort((left, right) => left - right); // Ascending order

        const tallyOfRanks = new Map();
        for (const cardValue of ranksInOrder) {
            tallyOfRanks.set(cardValue, (tallyOfRanks.get(cardValue) || 0) + 1);
        }

        const frequencyCounts = Array.from(tallyOfRanks.values()).sort((valA, valB) => valB - valA); // Frequencies descending
        const primaryCount = frequencyCounts[0] || 0;
        const secondaryCount = frequencyCounts[1] || 0;

        const checkFourKind = () => primaryCount === 4;
        const checkFullHouse = () => primaryCount === 3 && secondaryCount === 2;
        const checkThreeKind = () => primaryCount === 3 && secondaryCount !== 2;
        const checkTwoPairs = () => primaryCount === 2 && secondaryCount === 2;
        const checkOnePair = () => primaryCount === 2 && secondaryCount !== 2;

        const checkSequence = () => {
            if (primaryCount !== 1) return false; // All cards must be unique for a straight
            const lowestRank = ranksInOrder[0];
            const highestRank = ranksInOrder[4];

            // Standard consecutive sequence (e.g., 2,3,4,5,6 or 9,10,11,12,13)
            if (highestRank - lowestRank === 4) {
                return true;
            }

            // K-A straight (10,11,12,13,1 where 1 is Ace)
            // In ascending order, this would be [1,10,11,12,13]
            if (lowestRank === 1 && ranksInOrder[1] === 10 && ranksInOrder[2] === 11 && ranksInOrder[3] === 12 && highestRank === 13) {
                return true;
            }
            return false;
        };

        if (checkFourKind()) {
            return handResultLabels.FOUR_OF_A_KIND;
        } else if (checkFullHouse()) {
            return handResultLabels.FULL_HOUSE;
        } else if (checkThreeKind()) {
            return handResultLabels.THREE_OF_A_KIND;
        } else if (checkTwoPairs()) {
            return handResultLabels.TWO_PAIR;
        } else if (checkOnePair()) {
            return handResultLabels.ONE_PAIR;
        } else if (checkSequence()) {
            return handResultLabels.STRAIGHT;
        } else {
            return handResultLabels.NO_HAND;
        }
    };

    const allInputLines = inputSource.trim().split('\n');
    const results = [];
    for (const lineEntry of allInputLines) {
        if (lineEntry.length > 0) {
            results.push(processSingleHand(lineEntry));
        }
    }
    return results.join('\n');
};

const fileSystem = require("fs");
const systemInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const outputText = pokerEvaluator(systemInput);
console.log(outputText);