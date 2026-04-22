function acquireData(rawInputContent) {
    const contentLines = rawInputContent.split(/\r?\n/).filter(x => x.trim() !== '');

    const lineProcessor = {
        elementConverter: function(textRepresentation) {
            const numericValue = Number(textRepresentation);
            return (isNaN(numericValue)) ? textRepresentation : numericValue;
        },
        segmentParser: function(lineString) {
            return lineString.split(" ").map(this.elementConverter);
        },
        fetchLineContent: function(linePosition) {
            return contentLines[linePosition];
        },
        fetchLineSegments: function(linePosition) {
            return this.segmentParser(contentLines[linePosition]);
        },
        obtainContentRange: function(startingIndex, lengthLimit) {
            const endingIndex = (lengthLimit !== undefined && lengthLimit !== null) ? startingIndex + lengthLimit : undefined;
            return contentLines.slice(startingIndex, endingIndex).map(this.elementConverter);
        },
        obtainSegmentRange: function(startingIndex, lengthLimit) {
            const endingIndex = (lengthLimit !== undefined && lengthLimit !== null) ? startingIndex + lengthLimit : undefined;
            return contentLines.slice(startingIndex, endingIndex).map(this.segmentParser);
        }
    };

    return lineProcessor;
}

function performCalculation() {
    const dataAccessor = acquireData(require("fs").readFileSync("/dev/stdin", "utf8"));

    const initialParameters = dataAccessor.fetchLineSegments(0);
    const totalItems = initialParameters[0];
    const availableOptions = initialParameters[1];

    const rawOptionDetails = dataAccessor.obtainSegmentRange(1);
    const structuredOptions = [];

    for (let currentOptionIndex = 0; currentOptionIndex < availableOptions; currentOptionIndex++) {
        const costLineIdentifier = 2 * currentOptionIndex;
        const coverageLineIdentifier = 2 * currentOptionIndex + 1;

        const currentCost = rawOptionDetails[costLineIdentifier][0];
        const rawCoverageIndices = rawOptionDetails[coverageLineIdentifier];

        let coverageBitmask = 0;
        for (const coverageValue of rawCoverageIndices) {
            coverageBitmask |= (1 << (coverageValue - 1));
        }

        structuredOptions.push({
            price: currentCost,
            coverageMask: coverageBitmask
        });
    }

    const stateMinimumCosts = new Map();
    stateMinimumCosts.set(0, 0);

    const statesToProcess = [0];
    let queueHead = 0;

    const desiredCoverageState = (1 << totalItems) - 1;

    while (queueHead < statesToProcess.length) {
        const currentState = statesToProcess[queueHead++];
        const currentMinimumCost = stateMinimumCosts.get(currentState);

        for (const individualOption of structuredOptions) {
            const nextAchievableState = currentState | individualOption.coverageMask;
            const newTentativeCost = currentMinimumCost + individualOption.price;

            if (!stateMinimumCosts.has(nextAchievableState) || newTentativeCost < stateMinimumCosts.get(nextAchievableState)) {
                stateMinimumCosts.set(nextAchievableState, newTentativeCost);
                statesToProcess.push(nextAchievableState);
            }
        }
    }

    const finalAchievedCost = stateMinimumCosts.get(desiredCoverageState);

    return finalAchievedCost === undefined ? -1 : finalAchievedCost;
}

console.log(performCalculation());