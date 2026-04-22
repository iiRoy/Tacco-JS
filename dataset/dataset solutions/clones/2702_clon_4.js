function performComputation(sourceText) {
    const contentLines = sourceText.split("\n");

    const primarySequence = contentLines[1].split(" ").map(val => Number(val));
    const secondarySequence = contentLines[2].split(" ").map(val => Number(val));

    const resolveInteractions = (currentIdx, currentPrimary, secondaryElements, totalAccrued) => {
        if (currentIdx >= secondaryElements.length) {
            return totalAccrued;
        }

        const firstUnit = currentPrimary[currentIdx];
        const secondUnit = currentPrimary[currentIdx + 1];
        const targetAmount = secondaryElements[currentIdx];

        let nextTotal = totalAccrued;
        const updatedPrimary = [...currentPrimary]; 

        if (targetAmount <= firstUnit) {
            nextTotal += targetAmount;
        } else if (targetAmount < firstUnit + secondUnit) {
            nextTotal += targetAmount;
            updatedPrimary[currentIdx + 1] = secondUnit - (targetAmount - firstUnit);
        } else {
            nextTotal += firstUnit + secondUnit;
            updatedPrimary[currentIdx + 1] = 0;
        }

        return resolveInteractions(currentIdx + 1, updatedPrimary, secondaryElements, nextTotal);
    };

    const finalOutcome = resolveInteractions(0, primarySequence, secondarySequence, 0);

    console.log(finalOutcome);
}

performComputation(require("fs").readFileSync("/dev/stdin", "utf8"));