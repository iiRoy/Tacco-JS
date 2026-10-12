"use strict";

const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputTokens = rawInputContent.match(/\S+/g);
let tokenPointer = 0;

const fetchNextNumber = () => Number(inputTokens[tokenPointer++]);
const fetchNextBigInt = () => BigInt(inputTokens[tokenPointer++]);

const getSmallerBigInt = (valueOne, valueTwo) => (valueOne > valueTwo ? valueTwo : valueOne);

const performMainCalculation = () => {
    const totalCount = fetchNextNumber();
    let initialValA1 = fetchNextBigInt();
    let initialValA2 = fetchNextBigInt();

    const remainingBigInts = Array.from({ length: totalCount - 2 }, fetchNextBigInt);
    const cumulativeXorOfOthers = remainingBigInts.reduce((accumulator, currentElement) => accumulator ^ currentElement, 0n);

    const operationTimeLimit = Date.now() + 1900;

    const recursiveProcess = (currentA1State, currentA2State, currentAccumulatedAnswer) => {
        const currentCombinedXorState = currentA1State ^ currentA2State ^ cumulativeXorOfOthers;

        if (currentCombinedXorState === 0n) {
            return currentAccumulatedAnswer;
        }

        if (currentA1State === 1 || Date.now() > operationTimeLimit) {
            return -1;
        }

        const findAndApplyBitAdjustmentRecursively = (bitIndex) => {
            if (bitIndex < 0) {
                return { success: false, errorEncountered: true };
            }

            const currentBitPositionMask = 1n << BigInt(bitIndex);
            if ((currentCombinedXorState & currentBitPositionMask) === 0n) {
                return findAndApplyBitAdjustmentRecursively(bitIndex - 1);
            }

            let proposedShiftAmount = (currentA1State & (currentBitPositionMask - 1n)) + 1n;
            proposedShiftAmount = getSmallerBigInt(proposedShiftAmount, currentBitPositionMask - (currentA2State & (currentBitPositionMask - 1n)));

            if (proposedShiftAmount < currentA1State) {
                return {
                    success: true,
                    nextA1: currentA1State - proposedShiftAmount,
                    nextA2: currentA2State + proposedShiftAmount,
                    amountAddedToAnswer: proposedShiftAmount
                };
            } else {
                return { success: false, errorEncountered: true };
            }
        };

        const adjustmentResult = findAndApplyBitAdjustmentRecursively(40);

        if (adjustmentResult.errorEncountered) {
            return -1;
        }
        if (!adjustmentResult.success) {
            return -1;
        }

        return recursiveProcess(
            adjustmentResult.nextA1,
            adjustmentResult.nextA2,
            currentAccumulatedAnswer + adjustmentResult.amountAddedToAnswer
        );
    };

    return recursiveProcess(initialValA1, initialValA2, 0n);
};

const finalOutcome = performMainCalculation();
if (finalOutcome !== undefined) {
    console.log(String(finalOutcome));
}
