const acquireRawMaterial = require('fs').readFileSync('/dev/stdin', 'utf8');

const materialFragments = acquireRawMaterial.trim().split('\n');

const checkIntervalIntersection = (firstSpan, secondSpan) =>
    firstSpan.origin < secondSpan.terminus && firstSpan.terminus > secondSpan.origin;

const assessEntityCollection = (entityCollection) => {
    const massExceedanceDetected = entityCollection.some(primaryEntity => {
        const initialEntityMass = primaryEntity.quantity;

        const cumulativeIntersectingMass = entityCollection
            .filter(secondaryEntity => secondaryEntity !== primaryEntity && checkIntervalIntersection(primaryEntity, secondaryEntity))
            .reduce((currentSum, intersectingEntity) => currentSum + intersectingEntity.quantity, 0);

        return (initialEntityMass + cumulativeIntersectingMass) > 150;
    });

    return massExceedanceDetected ? "NG" : "OK";
};

const processAllInputBlocks = (remainingInputLines, collectedResults = []) => {
    if (remainingInputLines.length === 0) {
        return collectedResults;
    }

    const currentBlockSize = parseInt(remainingInputLines[0], 10);

    if (currentBlockSize === 0) {
        return collectedResults;
    }

    const currentBlockEntityLines = remainingInputLines.slice(1, 1 + currentBlockSize);

    const parsedEntitiesForBlock = currentBlockEntityLines.map(lineFragment => {
        const [unitWeight, startCoordinate, endCoordinate] = lineFragment.split(' ').map(Number);
        return { quantity: unitWeight, origin: startCoordinate, terminus: endCoordinate };
    });

    const blockEvaluationOutcome = assessEntityCollection(parsedEntitiesForBlock);

    return processAllInputBlocks(
        remainingInputLines.slice(1 + currentBlockSize),
        collectedResults.concat(blockEvaluationOutcome)
    );
};

const finalOutputStrings = processAllInputBlocks(materialFragments);

finalOutputStrings.forEach(resultString => console.log(resultString));