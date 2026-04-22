"use strict";

const parseInputBlock = (streamContent) => {
    const rawBlocks = streamContent.split(/\r?\n/).filter(segment => segment.trim() !== '');
    const totalItems = Number(rawBlocks[0]);
    const firstSet = rawBlocks[1].split(/\s+/).filter(Boolean).map(Number);
    const secondSet = rawBlocks[2].split(/\s+/).filter(Boolean).map(Number);
    return { totalItems, firstSet, secondSet };
};

const executeBalancing = (dataSource) => {
    const { totalItems, firstSet, secondSet } = parseInputBlock(dataSource);

    if (totalItems === 0) {
        console.log(0);
        return;
    }

    const itemRecords = [];
    for (let i = 0; i < totalItems; i++) {
        itemRecords.push({
            originalIndex: i,
            discrepancy: firstSet[i] - secondSet[i]
        });
    }

    const surplusRecords = itemRecords
        .filter(rec => rec.discrepancy > 0)
        .sort((a, b) => b.discrepancy - a.discrepancy);

    const deficitRecords = itemRecords
        .filter(rec => rec.discrepancy < 0)
        .sort((a, b) => a.discrepancy - b.discrepancy);

    const affectedIndices = new Set();
    let surplusPointer = 0;
    let deficitPointer = 0;

    while (surplusPointer < surplusRecords.length && deficitPointer < deficitRecords.length) {
        const currentSurplus = surplusRecords[surplusPointer];
        const currentDeficit = deficitRecords[deficitPointer];

        const requiredForDeficit = -currentDeficit.discrepancy;
        const availableFromSurplus = currentSurplus.discrepancy;

        affectedIndices.add(currentSurplus.originalIndex);
        affectedIndices.add(currentDeficit.originalIndex);

        if (availableFromSurplus >= requiredForDeficit) {
            currentSurplus.discrepancy -= requiredForDeficit;
            currentDeficit.discrepancy = 0;
            deficitPointer++;
            if (currentSurplus.discrepancy === 0) {
                surplusPointer++;
            }
        } else {
            currentDeficit.discrepancy += availableFromSurplus;
            currentSurplus.discrepancy = 0;
            surplusPointer++;
        }
    }

    const remainingNegativeSum = deficitRecords
        .slice(deficitPointer)
        .reduce((sum, rec) => sum + rec.discrepancy, 0);

    if (remainingNegativeSum < 0) {
        console.log(-1);
    } else {
        console.log(affectedIndices.size);
    }
};

executeBalancing(require('fs').readFileSync('/dev/stdin', 'utf8'));