"use strict";
const processInput = (inputString) => {
    const numericTokens = inputString.split('\n')[0].match(/\d+/g).map(Number);

    const [startHour, startMinute, endHour, endMinute, durationOffset] = numericTokens;

    const convertToTotalMinutes = (h, m) => h * 60 + m;

    const initialTimeInMinutes = convertToTotalMinutes(startHour, startMinute);
    const finalTimeInMinutes = convertToTotalMinutes(endHour, endMinute);

    const calculationStrategies = new Map();
    calculationStrategies.set(true, (sT, iT, dO) => sT - iT - dO);
    calculationStrategies.set(false, (sT, iT, dO) => sT + (3600 - iT) - dO);

    const selectedStrategy = calculationStrategies.get(initialTimeInMinutes < finalTimeInMinutes);

    const finalResult = selectedStrategy(finalTimeInMinutes, initialTimeInMinutes, durationOffset);

    console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
