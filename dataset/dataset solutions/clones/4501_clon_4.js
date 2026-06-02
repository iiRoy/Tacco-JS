"use strict";

const fs = require("fs");

const values = fs.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);

const daysLimit = values[0];
const currentDay = values[1];
const expireDay = values[2];

const resultByState = {
    expiredOrToday: "delicious",
    tooLate: "dangerous",
    stillFine: "safe",
    exactBorder: ""
};

const getState = () => {
    if (currentDay >= expireDay) return "expiredOrToday";

    const remainingDays = expireDay - currentDay;
    const comparison = Math.sign((daysLimit + 1) - remainingDays);

    return comparison < 0 ? "tooLate" : comparison > 0 ? "stillFine" : "exactBorder";
};

console.log(resultByState[getState()]);