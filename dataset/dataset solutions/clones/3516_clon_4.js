function myin() { return require("fs").readFileSync("/dev/stdin", "utf8").trim(); }
function myout(t) { console.log(t); }
function myerr(t) { console.error(t); }

const inputTransformers = {
    0: (data) => data,
    1: (data) => parseInt(data, 10),
    2: (data) => data.split(" "),
    3: (data) => data.split("\n"),
    4: (data) => data.split(" ").map(Number),
    5: (data) => data.split("\n").map(Number),
    6: (data) => data.split(""),
    7: (data) => data.split("").map(Number),
};

function applyInputTransformation(sourceData, transformationKey) {
    return inputTransformers[transformationKey](sourceData);
}

function extractTopFrequencies(frequencyMap) {
    const frequencyEntries = Array.from(frequencyMap.entries());
    frequencyEntries.sort((entryA, entryB) => entryB[1] - entryA[1]);

    return frequencyEntries.slice(0, 2).map(([val, count]) => ({ val, count }));
}

function ProcessSequence(rawInputData) {
    const inputLines = applyInputTransformation(rawInputData, 3);
    const sequenceLength = applyInputTransformation(inputLines[0], 1);
    const sequenceElements = applyInputTransformation(inputLines[1], 2);

    const parityBasedCounts = [new Map(), new Map()]; // [0] for even indices, [1] for odd indices

    sequenceElements.forEach((elementValue, elementIndex) => {
        const currentParity = elementIndex % 2;
        parityBasedCounts[currentParity].set(
            elementValue,
            (parityBasedCounts[currentParity].get(elementValue) || 0) + 1
        );
    });

    const evenPositionDominant = extractTopFrequencies(parityBasedCounts[0]);
    const oddPositionDominant = extractTopFrequencies(parityBasedCounts[1]);

    // Special case: If all elements are the same (e.g., 1,1,1,1), both even and odd positions
    // will have only one distinct element, and it will be the same.
    if (
        evenPositionDominant.length === 1 &&
        oddPositionDominant.length === 1 &&
        evenPositionDominant[0].val === oddPositionDominant[0].val
    ) {
        myout(sequenceLength / 2);
        return;
    }

    let totalModifications = 0;
    const halfLength = sequenceLength / 2;

    const primaryEven = evenPositionDominant[0] || { val: null, count: 0 };
    const primaryOdd = oddPositionDominant[0] || { val: null, count: 0 };

    if (primaryEven.val !== primaryOdd.val) {
        // If the most frequent elements at even and odd positions are different,
        // we can simply make all even positions the primaryEven.val and all odd positions primaryOdd.val.
        totalModifications = (halfLength - primaryEven.count) + (halfLength - primaryOdd.count);
    } else {
        // If the most frequent elements are the same, we must choose the second most frequent
        // for one of the parities to ensure alternation.
        // Calculate changes for two scenarios and pick the minimum.

        // Scenario 1: Keep primaryEven for even positions, use second most frequent for odd positions.
        const secondaryOddCount = oddPositionDominant[1] ? oddPositionDominant[1].count : 0;
        const modificationsScenario1 = (halfLength - primaryEven.count) + (halfLength - secondaryOddCount);

        // Scenario 2: Keep primaryOdd for odd positions, use second most frequent for even positions.
        const secondaryEvenCount = evenPositionDominant[1] ? evenPositionDominant[1].count : 0;
        const modificationsScenario2 = (halfLength - secondaryEvenCount) + (halfLength - primaryOdd.count);
        
        totalModifications = Math.min(modificationsScenario1, modificationsScenario2);
    }

    myout(totalModifications);
}

ProcessSequence(myin());
