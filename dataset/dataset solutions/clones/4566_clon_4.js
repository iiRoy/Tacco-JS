"use strict";

const processDimensions = (dimH, dimW) => {
    const totalSurface = dimH * dimW;
    let currentMinDelta = Infinity;

    const possibleFirstCutHeights = Array.from({ length: dimH - 1 }, (_, idx) => idx + 1);

    possibleFirstCutHeights.forEach(firstCutHeight => {
        // Strategy A: One horizontal cut, then vertical split on the remaining part
        const areaSegmentOneA = firstCutHeight * dimW;
        const remainingHeightForSplitA = dimH - firstCutHeight;
        const areaSegmentTwoA = remainingHeightForSplitA * (dimW / 2);
        const areaSegmentThreeA = totalSurface - areaSegmentOneA - areaSegmentTwoA;
        const allAreasA = [areaSegmentOneA, areaSegmentTwoA, areaSegmentThreeA];
        currentMinDelta = Math.min(currentMinDelta, Math.max(...allAreasA) - Math.min(...allAreasA));

        // Strategy B: One horizontal cut, then horizontal split on the remaining part
        const areaSegmentOneB = firstCutHeight * dimW;
        const remainingHeightForSplitB = dimH - firstCutHeight;
        const areaSegmentTwoB = (remainingHeightForSplitB / 2) * dimW;
        const areaSegmentThreeB = totalSurface - areaSegmentOneB - areaSegmentTwoB;
        const allAreasB = [areaSegmentOneB, areaSegmentTwoB, areaSegmentThreeB];
        currentMinDelta = Math.min(currentMinDelta, Math.max(...allAreasB) - Math.min(...allAreasB));
    });

    return currentMinDelta;
};

const entryPoint = (inputData) => {
    const [initialH, initialW] = inputData.trim().split(/\s+/).map(Number);

    const resultForOriginalOrientation = processDimensions(initialH, initialW);
    const resultForRotatedOrientation = processDimensions(initialW, initialH);

    console.log(Math.min(resultForOriginalOrientation, resultForRotatedOrientation));
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
