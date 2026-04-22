const parseNumeric = (textValue) => +textValue;

const convertStringArrayToNumbers = (stringArray) => stringArray.map(parseNumeric);

const executeProcessing = (rawDataContent) => {
    const allLines = rawDataContent.split('\n');

    const [totalElementsCount, thresholdValue] = convertStringArrayToNumbers(allLines[0].split(' '));
    const valueSequence = convertStringArrayToNumbers(allLines[1].split(' '));

    const cumulativeSums = valueSequence.reduce((acc, currentVal, currentIndex) => {
        const previousTotal = currentIndex === 0 ? 0 : acc[currentIndex - 1];
        acc.push(previousTotal + currentVal);
        return acc;
    }, []);

    let totalScoreAccumulator = (totalElementsCount + 1) * thresholdValue;

    const computeFinalScoreRecursively = (currentIdx, consecutiveCount, currentTotalScore) => {
        if (currentIdx < 0) {
            return currentTotalScore;
        }

        const nextConsecutiveCount = consecutiveCount + 1;
        const currentItem = valueSequence[currentIdx];
        const currentCumulative = cumulativeSums[currentIdx];

        const firstRuleApplies = nextConsecutiveCount < 3 || currentCumulative * (nextConsecutiveCount - 1) * 2 - currentItem * 2 < thresholdValue;

        let updatedTotalScore;
        let newConsecutiveState;

        if (firstRuleApplies) {
            const effectiveMultiplierBase = nextConsecutiveCount < 2 ? 2 : nextConsecutiveCount;
            const finalMultiplier = effectiveMultiplierBase * 2 + 1;
            updatedTotalScore = currentTotalScore + currentItem * finalMultiplier;
            newConsecutiveState = nextConsecutiveCount;
        } else {
            updatedTotalScore = currentTotalScore + currentItem * 5 + thresholdValue;
            newConsecutiveState = 1;
        }

        return computeFinalScoreRecursively(currentIdx - 1, newConsecutiveState, updatedTotalScore);
    };

    totalScoreAccumulator = computeFinalScoreRecursively(totalElementsCount - 1, 0, totalScoreAccumulator);

    console.log(totalScoreAccumulator);
};

(function() {
    const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
    executeProcessing(receivedContent);
})();