function ProcessInputAndComputeResult(incomingText) {
    const numSequence = incomingText.split('\n').slice(0, 5).map(Number);

    const dataEntities = numSequence.map((val, idx) => ({ value: val, index: idx }));

    const initialRemainderOfFirst = dataEntities[0].value % 10;

    const prioritizedEntities = dataEntities.map(entity => {
        let priorityScore;
        if (entity.index === 0 && initialRemainderOfFirst === 0) {
            // This condition matches the original's implicit behavior:
            // if the first number ends in 0, it's chosen as special.
            priorityScore = -Infinity; // Assign highest priority
        } else if (entity.value % 10 === 0) {
            // Numbers ending in 0 (and not the special first one) are low priority
            priorityScore = Infinity; // Assign lowest priority
        } else {
            // For numbers with non-zero last digits, smaller remainder means higher priority
            priorityScore = entity.value % 10;
        }
        return { ...entity, score: priorityScore };
    });

    prioritizedEntities.sort((elementA, elementB) => {
        // Primary sort by score (lower score is better)
        if (elementA.score !== elementB.score) {
            return elementA.score - elementB.score;
        }
        // Secondary sort by original index for tie-breaking (lower index is better)
        return elementA.index - elementB.index;
    });

    const uniqueEntityIndex = prioritizedEntities[0].index;

    const calculatedTotal = numSequence.reduce((accumulator, currentVal, currentIndex) => {
        if (currentIndex === uniqueEntityIndex) {
            return accumulator + currentVal;
        } else {
            // Round up to the nearest multiple of 10
            return accumulator + Math.ceil(currentVal / 10) * 10;
        }
    }, 0);

    console.log(calculatedTotal);
}

ProcessInputAndComputeResult(require("fs").readFileSync("/dev/stdin", "utf8"));