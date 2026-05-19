"use strict";
const processInput = (inputString) => {

    const inputLines = inputString.split('\n');

    const rawParameters = inputLines.shift().split(' ');
    const numericParameters = rawParameters.map(val => parseInt(val, 10));

    const [
        initialHour,
        initialMinute,
        finalHour,
        finalMinute,
        deductionValue
    ] = numericParameters;

    const MINUTES_PER_HOUR = 60;
    const MAGIC_TOTAL_MINUTES_FOR_DAY_WRAP = 3600; // Preserving the original magic number 3600

    const initialTimeInMinutes = (initialHour * MINUTES_PER_HOUR) + initialMinute;
    const finalTimeInMinutes = (finalHour * MINUTES_PER_HOUR) + finalMinute;

    let calculatedDuration;

    if (initialTimeInMinutes < finalTimeInMinutes) {
        calculatedDuration = finalTimeInMinutes - initialTimeInMinutes - deductionValue;
    } else {
        const remainingMinutesUntilMagicWrap = MAGIC_TOTAL_MINUTES_FOR_DAY_WRAP - initialTimeInMinutes;
        calculatedDuration = finalTimeInMinutes + remainingMinutesUntilMagicWrap - deductionValue;
    }

    console.log(calculatedDuration);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
