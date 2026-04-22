"use strict";

const processDataStream = (rawSource) => {
    const parseStream = (textInput) => {
        let linesBuffer = [];
        let readCursor = 0;
        let cleanedInput = textInput.trim();

        while (readCursor < cleanedInput.length) {
            let nextLineBreak = cleanedInput.indexOf('\n', readCursor);
            let currentLineSegment;
            if (nextLineBreak === -1) {
                currentLineSegment = cleanedInput.substring(readCursor);
                readCursor = cleanedInput.length;
            } else {
                currentLineSegment = cleanedInput.substring(readCursor, nextLineBreak);
                readCursor = nextLineBreak + 1;
            }
            if (currentLineSegment) linesBuffer.push(currentLineSegment);
        }

        let primaryHeaderLine = linesBuffer[0];
        let firstSpacePosition = primaryHeaderLine.indexOf(' ');
        let initialQuantity = Number(primaryHeaderLine.substring(0, firstSpacePosition));
        let targetThreshold = Number(primaryHeaderLine.substring(firstSpacePosition + 1));

        let coordinatePairs = [];
        for (let k = 1; k <= initialQuantity; k++) {
            let currentDataLine = linesBuffer[k];
            let dataSpacePosition = currentDataLine.indexOf(' ');
            let coordinateA = Number(currentDataLine.substring(0, dataSpacePosition));
            let coordinateB = Number(currentDataLine.substring(dataSpacePosition + 1));
            coordinatePairs.push({ valA: coordinateA, valB: coordinateB });
        }
        return { initialQuantity, targetThreshold, coordinatePairs };
    };

    const { initialQuantity, targetThreshold, coordinatePairs } = parseStream(rawSource);

    let cumulativeSum = 0;
    const transformedRecords = coordinatePairs.reduce((accumulator, currentPair) => {
        cumulativeSum += currentPair.valB;
        accumulator.push({
            primaryIndex: currentPair.valA,
            valueUnit: currentPair.valB,
            runningTotal: cumulativeSum
        });
        return accumulator;
    }, []);

    let matchingRecord = null;
    let recordIndex = 0;
    while (recordIndex < transformedRecords.length) {
        const inspectRecord = transformedRecords[recordIndex];
        if (inspectRecord.runningTotal >= targetThreshold) {
            matchingRecord = inspectRecord;
            break;
        }
        recordIndex++;
    }

    if (matchingRecord) {
        console.log(JSON.stringify({
            num: matchingRecord.primaryIndex,
            amount: matchingRecord.valueUnit,
            totalAmount: matchingRecord.runningTotal
        }));
        console.log(matchingRecord.primaryIndex);
    } else {
        console.log(JSON.stringify(transformedRecords.map(rec => ({
            num: rec.primaryIndex,
            amount: rec.valueUnit,
            totalAmount: rec.runningTotal
        }))));
    }
};

const executeProcessing = (inputSource) => {
    processDataStream(inputSource);
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));