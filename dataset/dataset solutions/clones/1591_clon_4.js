"use strict";

const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
const numericDataStream = dataSource.trim().split(/\s+/).map(Number);
let streamPosition = 0;

const acquireValue = () => numericDataStream[streamPosition++];
const extractSegment = (itemCount) => {
    const segment = numericDataStream.slice(streamPosition, streamPosition + itemCount);
    streamPosition += itemCount;
    return segment;
};

const createTwoDimensionalArray = (rows, columns, initialContent) => 
    Array.from({ length: rows }, () => Array.from({ length: columns }, () => initialContent));

const executeComputation = () => {
    const matrixDimension = acquireValue();
    const scoreMap = createTwoDimensionalArray(matrixDimension, matrixDimension, -1);
    let overallHighestScore = 0;
    let totalOffset = 0;

    const initialPairIndices = extractSegment(2).sort((v1, v2) => v1 - v2).map(val => val - 1);
    scoreMap[initialPairIndices[0]][initialPairIndices[1]] = 0;

    const generateUpdateAndTrackMax = (currentMap, inputA, inputB, inputC, inputD) => {
        const candidateScore = Math.max(currentMap[inputC][inputD], currentMap[inputA][inputB] + 1);
        overallHighestScore = Math.max(overallHighestScore, candidateScore);
        return { targetRow: inputC, targetCol: inputD, newValue: candidateScore };
    };

    const applyFirstConditionSet = (valA, valB, valC, dim, updateCollector) => {
        if (valA !== valB) {
            updateCollector(valB, valB, valA, valC);
        } else {
            for (let k = 0; k < valA; k++) {
                updateCollector(k, valA, k, valC);
            }
            for (let k = valA + 1; k < valC; k++) {
                updateCollector(valA, k, k, valC);
            }
            for (let k = valC; k < dim; k++) {
                updateCollector(valA, k, valC, k);
            }
        }
    };

    const applySecondConditionSet = (valA, valB, valC, dim, updateCollector) => {
        if (valB !== valC) {
            updateCollector(valC, valC, valA, valB);
        } else {
            for (let k = 0; k < valA; k++) {
                updateCollector(k, valB, k, valA);
            }
            for (let k = valA; k < valC; k++) {
                updateCollector(k, valC, valA, k);
            }
            for (let k = valC + 1; k < dim; k++) {
                updateCollector(valC, k, valA, k);
            }
        }
    };

    const iterateOverSegments = (currentIteration, currentMapState, currentTotalOffset) => {
        if (currentIteration >= matrixDimension) {
            return { finalMap: currentMapState, finalOffset: currentTotalOffset };
        }

        const currentTripletIndices = extractSegment(3).sort((v1, v2) => v1 - v2).map(val => val - 1);

        if (currentTripletIndices[0] === currentTripletIndices[2]) {
            return iterateOverSegments(
                currentIteration + 1,
                currentMapState,
                currentTotalOffset + 1
            );
        }

        let collectedUpdatesForIteration = [];

        const performTransitionAndCollect = (idx1, idx2, idx3, idx4) => {
            const updateResult = generateUpdateAndTrackMax(currentMapState, idx1, idx2, idx3, idx4);
            collectedUpdatesForIteration.push(updateResult);
        };

        const firstIndex = currentTripletIndices[0];
        const secondIndex = currentTripletIndices[1];
        const thirdIndex = currentTripletIndices[2];

        performTransitionAndCollect(firstIndex, firstIndex, secondIndex, thirdIndex);

        applyFirstConditionSet(firstIndex, secondIndex, thirdIndex, matrixDimension, performTransitionAndCollect);
        applySecondConditionSet(firstIndex, secondIndex, thirdIndex, matrixDimension, performTransitionAndCollect);

        collectedUpdatesForIteration.forEach(update => {
            currentMapState[update.targetRow][update.targetCol] = Math.max(currentMapState[update.targetRow][update.targetCol], update.newValue);
        });

        return iterateOverSegments(
            currentIteration + 1,
            currentMapState,
            currentTotalOffset
        );
    };

    const finalStateAfterIterations = iterateOverSegments(1, scoreMap, totalOffset);
    
    const lastSingleIndex = acquireValue() - 1;
    
    generateUpdateAndTrackMax(
        finalStateAfterIterations.finalMap,
        lastSingleIndex, lastSingleIndex, lastSingleIndex, lastSingleIndex
    );
    
    return overallHighestScore + finalStateAfterIterations.finalOffset;
};

const finalResult = executeComputation();
if (finalResult !== undefined) console.log(String(finalResult));