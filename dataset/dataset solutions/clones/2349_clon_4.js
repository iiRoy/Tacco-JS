"use strict";

const processRawData = (dataText) => {
    const segmentations = dataText.trim().split('\n');
    const entityQuantity = Number(segmentations[0]);
    let ptr = 1;

    const aggregateStatements = (memo, currentEntityIdx) => {
        const claimCount = Number(segmentations[ptr++]);
        for (let k = 0; k < claimCount; k++) {
            const [targetStr, valueStr] = segmentations[ptr++].split(' ');
            memo.push({
                originator: currentEntityIdx,
                recipient: Number(targetStr) - 1,
                assertion: Number(valueStr)
            });
        }
        return memo;
    };

    const fullStatementList = Array.from({ length: entityQuantity }, (_, idx) => idx).reduce(aggregateStatements, []);

    return { entityQuantity, fullStatementList };
};

const evaluateClaims = (processedData) => {
    const { entityQuantity, fullStatementList } = processedData;

    const assertionsBySubject = new Map(Array.from({ length: entityQuantity }, (_, idx) => [
        idx,
        {
            unfavorableReportsMade: new Set(),
            favorableReportsMade: new Set(),
            totalUnfavorableReportsMade: 0,
            unfavorableReportsReceived: new Set(),
        }
    ]));

    fullStatementList.forEach(report => {
        const { originator, recipient, assertion } = report;
        const subjectData = assertionsBySubject.get(originator);
        if (assertion === 0) {
            subjectData.unfavorableReportsMade.add(recipient);
            subjectData.totalUnfavorableReportsMade++;
        } else {
            subjectData.favorableReportsMade.add(recipient);
        }

        if (assertion === 0) {
            assertionsBySubject.get(recipient).unfavorableReportsReceived.add(originator);
        }
    });

    let firstCategoryDiscrepancy = 0;
    const secondCategoryDiscrepancyPairs = new Set();

    assertionsBySubject.forEach((subjectInfo, subjectIdentifier) => {
        if (subjectInfo.unfavorableReportsMade.size > 0 && subjectInfo.favorableReportsMade.size > 0) {
            firstCategoryDiscrepancy += subjectInfo.totalUnfavorableReportsMade;
        }

        subjectInfo.unfavorableReportsMade.forEach(targetIdentifier => {
            if (assertionsBySubject.get(targetIdentifier).unfavorableReportsReceived.has(subjectIdentifier)) {
                const pairId = [subjectIdentifier, targetIdentifier].sort((a, b) => a - b).join('_');
                secondCategoryDiscrepancyPairs.add(pairId);
            }
        });
    });

    return entityQuantity - (firstCategoryDiscrepancy + secondCategoryDiscrepancyPairs.size);
};

const performAnalysis = (inputPayload) => {
    const dataProcessed = processRawData(inputPayload);
    return evaluateClaims(dataProcessed);
};

console.log(performAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8')));