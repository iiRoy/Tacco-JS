const processInput = (sourceString) => {
    const inputSegments = sourceString.split('\n');
    const totalCount = parseInt(inputSegments[0], 10);
    const digitTokens = inputSegments[1].split(' ');

    const groupSize = totalCount / 2;

    const aggregateFrequencies = (collection) =>
        Object.entries(collection).reduce(
            (accumulator, [valueToken, quantity]) => {
                if (quantity > accumulator.primaryQuantity) {
                    return { primaryValue: valueToken, primaryQuantity: quantity };
                }
                return accumulator;
            },
            { primaryValue: null, primaryQuantity: 0 }
        );

    const { firstGroupTallies, secondGroupTallies, allAdjacentMatch } = digitTokens.reduce(
        (state, element, position) => {
            const currentElement = element;
            if (position % 2 === 0) { // Even index
                state.firstGroupTallies[currentElement] = (state.firstGroupTallies[currentElement] || 0) + 1;
                if (state.allAdjacentMatch && (position + 1 < digitTokens.length)) {
                    if (currentElement !== digitTokens[position + 1]) {
                        state.allAdjacentMatch = false;
                    }
                }
            } else { // Odd index
                state.secondGroupTallies[currentElement] = (state.secondGroupTallies[currentElement] || 0) + 1;
            }
            return state;
        },
        { firstGroupTallies: {}, secondGroupTallies: {}, allAdjacentMatch: true }
    );

    if (allAdjacentMatch) {
        return groupSize;
    }

    const firstGroupStats = aggregateFrequencies(firstGroupTallies);
    const secondGroupStats = aggregateFrequencies(secondGroupTallies);

    const neededModifications = (groupSize - firstGroupStats.primaryQuantity) +
                                 (groupSize - secondGroupStats.primaryQuantity);

    return neededModifications;
};

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));