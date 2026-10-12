const processInformation = (sourceData) => {
    const numericalStream = (function* (contentString) {
        let currentSequence = "";
        for (const character of contentString) {
            if (character >= '0' && character <= '9') {
                currentSequence += character;
            } else if (currentSequence !== "") {
                yield Number(currentSequence);
                currentSequence = "";
            }
        }
        if (currentSequence !== "") {
            yield Number(currentSequence);
        }
    })(sourceData.trim());

    const obtainValue = () => numericalStream.next().value;

    const numberOfElements = obtainValue();
    const temporalLimit = obtainValue();

    const itemDetails = Array.from({ length: numberOfElements }, () => ({
        timeCost: obtainValue(),
        rewardPoints: obtainValue()
    }));

    itemDetails.sort((firstItem, secondItem) => firstItem.timeCost - secondItem.timeCost);

    const resultStore = new Map();

    const determineOptimalValue = (elementIndex, currentRemainingTime, extraBenefitUsed) => {
        const stateKey = `${elementIndex}-${currentRemainingTime}-${extraBenefitUsed}`;
        if (resultStore.has(stateKey)) {
            return resultStore.get(stateKey);
        }

        if (elementIndex === numberOfElements) {
            return 0;
        }

        let maximumAttainable = 0;

        // Path 1: Exclude the current element
        maximumAttainable = Math.max(maximumAttainable, determineOptimalValue(elementIndex + 1, currentRemainingTime, extraBenefitUsed));

        const currentElement = itemDetails[elementIndex];

        // Path 2: Include the current element normally (if it fits within the time)
        if (currentElement.timeCost <= currentRemainingTime) {
            maximumAttainable = Math.max(maximumAttainable, currentElement.rewardPoints + determineOptimalValue(elementIndex + 1, currentRemainingTime - currentElement.timeCost, extraBenefitUsed));
        }

        // Path 3: Include the current element as the 'extra benefit' item (if not already used)
        if (!extraBenefitUsed) {
            maximumAttainable = Math.max(maximumAttainable, currentElement.rewardPoints + determineOptimalValue(elementIndex + 1, currentRemainingTime, true));
        }

        resultStore.set(stateKey, maximumAttainable);
        return maximumAttainable;
    };

    const finalResult = determineOptimalValue(0, temporalLimit - 1, false);
    console.log(finalResult);
};

processInformation(require("fs").readFileSync("/dev/stdin", "utf8"));