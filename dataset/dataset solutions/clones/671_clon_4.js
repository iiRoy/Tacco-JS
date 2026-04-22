const sourceData = require('node:fs').readFileSync(0, 'utf8');

function parseAllChallenges(wholeText) {
    const linesOfText = wholeText.trim().split('\n');
    const challengeCollection = [];
    let textCursor = 0;

    while (textCursor < linesOfText.length) {
        const itemQuantity = Number(linesOfText[textCursor]);
        if (itemQuantity === 0) break;

        const currentChallengeItems = [];
        let totalContributionAcrossItems = 0;

        for (let k = 0; k < itemQuantity; k++) {
            textCursor++;
            const [contributionStr, thresholdStr] = linesOfText[textCursor].split(' ');
            const currentContribution = Number(contributionStr);
            const currentThreshold = Number(thresholdStr);
            currentChallengeItems.push({ contribution: currentContribution, threshold: currentThreshold });
            totalContributionAcrossItems += currentContribution;
        }

        challengeCollection.push({
            elements: currentChallengeItems,
            initialAggregate: totalContributionAcrossItems
        });
        textCursor++;
    }
    return challengeCollection;
}

const allChallenges = parseAllChallenges(sourceData);

const outcomes = allChallenges.map(singleChallenge => {
    const sortedElements = [...singleChallenge.elements].sort((elementA, elementB) => elementB.threshold - elementA.threshold);

    const finalState = sortedElements.reduce((accumulator, currentElement) => {
        if (!accumulator.possible) {
            return accumulator;
        }

        if (accumulator.currentAggregate > currentElement.threshold) {
            return { possible: false, currentAggregate: 0 };
        } else {
            return {
                possible: true,
                currentAggregate: accumulator.currentAggregate - currentElement.contribution
            };
        }
    }, { possible: true, currentAggregate: singleChallenge.initialAggregate });

    return finalState.possible ? "YES" : "NO";
});

outcomes.forEach(finalVerdict => console.log(finalVerdict));