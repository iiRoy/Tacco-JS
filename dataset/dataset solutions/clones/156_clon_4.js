const fileSystem = require("fs");

fileSystem.readFileSync("/dev/stdin", "utf8").trim().split('\n').map(function(inputLineContent) {
    const numericCardValues = inputLineContent.split(',').map(Number).sort((valueA, valueB) => valueB - valueA);

    const countMap = new Map();
    for (const currentCard of numericCardValues) {
        countMap.set(currentCard, (countMap.get(currentCard) || 0) + 1);
    }

    const sortedCounts = Array.from(countMap.values()).sort((countA, countB) => countB - countA);
    const primaryFrequency = sortedCounts[0];
    const secondaryFrequency = sortedCounts[1] || 0;

    const determineStraight = (cardsArray) => {
        const isStandardConsecutive = cardsArray[0] - cardsArray[4] === 4;
        const isAceHighSpecial = (cardsArray[0] - cardsArray[3] === 3 && cardsArray[4] === 1);
        return isStandardConsecutive || isAceHighSpecial;
    };

    let handClassification;

    if (primaryFrequency === 4) {
        handClassification = "four card";
    } else if (primaryFrequency === 3) {
        if (secondaryFrequency === 2) {
            handClassification = "full house";
        } else {
            handClassification = "three card";
        }
    } else if (primaryFrequency === 2) {
        if (secondaryFrequency === 2) {
            handClassification = "two pair";
        } else {
            handClassification = "one pair";
        }
    } else if (determineStraight(numericCardValues)) {
        handClassification = "straight";
    } else {
        handClassification = "null";
    }

    console.log(handClassification);
});
