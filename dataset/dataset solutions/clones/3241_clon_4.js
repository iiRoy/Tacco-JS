function processInputData(sourceText) {
    const contentLines = sourceText.trim().split('\n');
    const totalEntities = Number(contentLines[0]);

    const entityRecords = contentLines.slice(1).map((lineSegment, initialOrder) => {
        const [valueX, valueY] = lineSegment.split(' ').map(Number);
        return { primaryValue: valueX, secondaryValue: valueY, originalKey: initialOrder };
    });

    const collectionA = [...entityRecords].sort((itemA, itemB) => {
        if (itemA.primaryValue !== itemB.primaryValue) {
            return itemB.primaryValue - itemA.primaryValue;
        }
        return itemB.secondaryValue - itemA.secondaryValue;
    });

    const collectionB = [...entityRecords].sort((itemA, itemB) => {
        if (itemA.secondaryValue !== itemB.secondaryValue) {
            return itemB.secondaryValue - itemA.secondaryValue;
        }
        return itemB.primaryValue - itemA.primaryValue;
    });

    let scoreAccumulatorA = 0;
    let scoreAccumulatorB = 0;
    const utilizedKeys = new Set();

    let pointerA = 0;
    let pointerB = 0;

    for (let currentPhase = 0; currentPhase < totalEntities; currentPhase++) {
        if (currentPhase % 2 === 0) {
            while (utilizedKeys.has(collectionA[pointerA].originalKey)) {
                pointerA++;
            }
            const chosenEntity = collectionA[pointerA];
            scoreAccumulatorA += chosenEntity.primaryValue;
            utilizedKeys.add(chosenEntity.originalKey);
            pointerA++;
        } else {
            while (utilizedKeys.has(collectionB[pointerB].originalKey)) {
                pointerB++;
            }
            const chosenEntity = collectionB[pointerB];
            scoreAccumulatorB += chosenEntity.secondaryValue;
            utilizedKeys.add(chosenEntity.originalKey);
            pointerB++;
        }
    }

    const finalCalculation = scoreAccumulatorA - scoreAccumulatorB;
    console.log(finalCalculation);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));