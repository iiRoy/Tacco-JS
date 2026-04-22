const dataStream = require('node:fs').readFileSync(0, 'utf8');

function* getTaskBlocks(rawContent) {
    const contentLines = rawContent.trim().split('\n');
    let lineIndex = 0;

    const readNumericLine = () => Number(contentLines[lineIndex++]);
    const readNumericPair = () => contentLines[lineIndex++].split(' ').map(Number);
    const readNumericArray = (count) => {
        const collection = [];
        for (let k = 0; k < count; ++k) {
            collection.push(readNumericLine());
        }
        return collection;
    };

    while (true) {
        const [paramA, paramB] = readNumericPair();
        if (paramA === 0 && paramB === 0) {
            break;
        }

        const modifierList = readNumericArray(paramB);
        const targetList = readNumericArray(paramA);

        yield {
            elementCount: paramA,
            modifierCount: paramB,
            mods: modifierList,
            targets: targetList
        };
    }
}

for (const currentTask of getTaskBlocks(dataStream)) {
    const initialCostDistribution = new Map().set(128, 0);

    const calculateNextCostStates = (previousCostStates, currentTargetValue) => {
        const nextCostStates = new Map();
        for (const [prevValueState, accumulatedCost] of previousCostStates.entries()) {
            for (const modifierEffect of currentTask.mods) {
                const resultantValueState = Math.max(0, Math.min(255, prevValueState + modifierEffect));
                const currentTransitionCost = accumulatedCost + (currentTargetValue - resultantValueState) ** 2;

                nextCostStates.set(
                    resultantValueState,
                    Math.min(nextCostStates.get(resultantValueState) ?? Infinity, currentTransitionCost)
                );
            }
        }
        return nextCostStates;
    };

    const finalCostDistribution = currentTask.targets.reduce(calculateNextCostStates, initialCostDistribution);

    let ultimateMinimalCost = Infinity;
    for (const finalCost of finalCostDistribution.values()) {
        ultimateMinimalCost = Math.min(ultimateMinimalCost, finalCost);
    }
    console.log(ultimateMinimalCost);
}