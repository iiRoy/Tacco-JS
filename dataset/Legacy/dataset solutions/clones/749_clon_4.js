const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.trim().split('\n');

function* parameterStream(sourceLines) {
    let currentIdx = 0;
    while (true) {
        const firstSegment = sourceLines[currentIdx];
        if (firstSegment === "0 0 0 0 0") {
            return;
        }
        const secondSegment = sourceLines[currentIdx + 1];
        const combinedSegments = `${firstSegment} ${secondSegment}`;
        const numericalValues = combinedSegments.split(' ').map(val => parseInt(val, 10));
        yield numericalValues;
        currentIdx += 2;
    }
}

function calculateOptimalValue(
    paramAlpha, paramBeta, paramGamma, paramDelta, paramEpsilon,
    quantityAlpha, quantityBeta, totalQuantityGamma
) {
    let accumulatedValue = 0;

    if (totalQuantityGamma === 0) {
        accumulatedValue += paramDelta * paramEpsilon;
    } else {
        const fullBatchCount = Math.floor((totalQuantityGamma - 1) / paramDelta) + 1;
        accumulatedValue += fullBatchCount * paramDelta * paramEpsilon;
    }

    const remainderUnits = totalQuantityGamma % paramDelta;
    const unitsToDeplete = paramDelta - remainderUnits;

    let depletedFromAlpha;
    if (quantityAlpha < unitsToDeplete) {
        depletedFromAlpha = quantityAlpha;
    } else {
        depletedFromAlpha = unitsToDeplete;
    }
    quantityAlpha -= depletedFromAlpha;

    const remainingToDeplete = unitsToDeplete - depletedFromAlpha;
    let depletedFromBeta;
    if (quantityBeta < remainingToDeplete) {
        depletedFromBeta = quantityBeta;
    } else {
        depletedFromBeta = remainingToDeplete;
    }
    quantityBeta -= depletedFromBeta;

    accumulatedValue += paramAlpha * quantityAlpha + paramBeta * quantityBeta;

    console.log(accumulatedValue);
}

for (const params of parameterStream(dataLines)) {
    calculateOptimalValue(...params);
}
