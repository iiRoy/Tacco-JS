const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trimEnd().split('\n');
let currentInputPointer = 0;

function executeProcessingCycle() {
    const entryCount = Number(processedInputLines[currentInputPointer++]);

    if (entryCount === 0) {
        return false;
    }

    const collectedPerformanceData = Array.from({ length: entryCount }, () => {
        const currentLineSegments = processedInputLines[currentInputPointer++].split(' ');
        const [entityLabel, ...numericalValues] = currentLineSegments;
        const [
            paramP, paramA, paramB, paramC, paramD,
            paramE, paramF, paramS, paramM
        ] = numericalValues.map(Number);

        const calculatedDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
        const calculatedEarnings = (paramF * paramS * paramM) - paramP;
        
        return { entityLabel, performanceMetric: calculatedEarnings / calculatedDuration };
    });

    collectedPerformanceData.sort((itemAlpha, itemBeta) => {
        if (itemAlpha.performanceMetric === itemBeta.performanceMetric) {
            return itemAlpha.entityLabel.localeCompare(itemBeta.entityLabel);
        }
        return itemBeta.performanceMetric - itemAlpha.performanceMetric;
    });

    collectedPerformanceData.forEach(dataPoint => console.log(dataPoint.entityLabel));
    console.log("#");
    
    return true;
}

while (executeProcessingCycle()) {
    // Continue processing batches until executeProcessingCycle returns false (when n is 0)
}
