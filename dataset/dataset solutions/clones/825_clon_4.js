const acquireSourceData = require('fs').readFileSync;

const decomposeEntityLine = (lineContent, initialPosition) => {
    const segments = lineContent.split(' ');
    const entityTag = segments.shift();
    const numericalParameters = segments.map(Number);

    return {
        tag: entityTag,
        paramP: numericalParameters[0],
        paramA: numericalParameters[1],
        paramB: numericalParameters[2],
        paramC: numericalParameters[3],
        paramD: numericalParameters[4],
        paramE: numericalParameters[5],
        paramF: numericalParameters[6],
        paramS: numericalParameters[7],
        paramM: numericalParameters[8],
        originalSequence: initialPosition
    };
};

const computePerformanceRatio = (entityObject) => {
    const { tag, paramP, paramA, paramB, paramC, paramD, paramE, paramF, paramS, paramM, originalSequence } = entityObject;

    const totalDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
    const netEarnings = (paramF * paramS * paramM) - paramP;

    const performanceValue = totalDuration === 0
        ? (netEarnings === 0 ? NaN : (netEarnings > 0 ? Infinity : -Infinity))
        : netEarnings / totalDuration;

    return {
        entityIdentifier: tag,
        ratioMetric: performanceValue,
        originalSequence
    };
};

const rankEntities = (firstItem, secondItem) => {
    if (firstItem.ratioMetric === secondItem.ratioMetric) {
        return firstItem.entityIdentifier.localeCompare(secondItem.entityIdentifier);
    }
    return secondItem.ratioMetric - firstItem.ratioMetric;
};

const processInputBlocks = (fullContent) => {
    const allInputLines = fullContent.trim().split('\n');
    const assembledOutputLines = [];
    let currentLineIndex = 0;

    while (currentLineIndex < allInputLines.length) {
        const currentBlockSize = Number(allInputLines[currentLineIndex++]);

        if (currentBlockSize === 0) {
            break;
        }

        const entitiesInBlock = Array.from({ length: currentBlockSize }, (_, idx) => {
            const line = allInputLines[currentLineIndex++];
            return decomposeEntityLine(line, idx);
        });

        const evaluatedEntities = entitiesInBlock.map(computePerformanceRatio);

        evaluatedEntities.sort(rankEntities);

        const sortedIdentifiers = evaluatedEntities.map(item => item.entityIdentifier);

        assembledOutputLines.push(...sortedIdentifiers, "#");
    }

    return assembledOutputLines.join('\n');
};

const rawTextContent = acquireSourceData(0, 'utf8');
const finalDisplayContent = processInputBlocks(rawTextContent);
console.log(finalDisplayContent);