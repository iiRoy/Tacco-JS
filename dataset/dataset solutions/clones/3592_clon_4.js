"use strict";

((inputSource) => {
    const getAbsolute = (valueParameter) => valueParameter < 0 ? -valueParameter : valueParameter;
    const getMinimum = (valOne, valTwo) => valOne < valTwo ? valOne : valTwo;

    const numericalTokens = inputSource.split(/\s+/).filter(Boolean).map(Number);

    const initialExtent = numericalTokens[0];
    const spanSize = numericalTokens[1];
    const coordinateSet = numericalTokens.slice(2);

    const pathCosts = Array.from({ length: initialExtent - spanSize + 1 }, (_, currentOffset) => {
        const pointAlpha = coordinateSet[currentOffset];
        const pointBeta = coordinateSet[currentOffset + spanSize - 1];

        const costFromAlpha = getAbsolute(pointAlpha) + getAbsolute(pointBeta - pointAlpha);
        const costFromBeta = getAbsolute(pointBeta) + getAbsolute(pointAlpha - pointBeta);

        return getMinimum(costFromAlpha, costFromBeta);
    });

    const overallMinimalCost = pathCosts.reduce((minimumYet, currentCost) => getMinimum(minimumYet, currentCost), Infinity);

    console.log(overallMinimalCost);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));