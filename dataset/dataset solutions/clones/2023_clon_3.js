"use strict";

const computeFinalScore = (baseVal, bigUnitDivisor, bigUnitMultiplier, smallUnitDivisor, smallUnitMultiplier) => {
    const bigComponent = baseVal / bigUnitDivisor;
    const remainingValue = baseVal - bigComponent * bigUnitDivisor;
    const smallComponent = remainingValue / smallUnitDivisor;
    const finalScore = bigComponent * bigUnitMultiplier + smallComponent * smallUnitMultiplier;
    return finalScore;
};

const processRawInput = (inputContent) => {
    const BIG_UNIT_DIVISOR_VAL = 500;
    const BIG_UNIT_MULTIPLIER_VAL = 1000;
    const SMALL_UNIT_DIVISOR_VAL = 5;
    const SMALL_UNIT_MULTIPLIER_VAL = 5;

    const cleanedInput = inputContent.trim();
    const baseNumericValue = parseInt(cleanedInput[0]);

    const calculatedResult = computeFinalScore(
        baseNumericValue,
        BIG_UNIT_DIVISOR_VAL,
        BIG_UNIT_MULTIPLIER_VAL,
        SMALL_UNIT_DIVISOR_VAL,
        SMALL_UNIT_MULTIPLIER_VAL
    );

    console.log(calculatedResult);
};

processRawInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
