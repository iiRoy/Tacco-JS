'use strict';

function ProcessInput(rawData) {
    const parsedValues = rawData.split("\n")[0].split(" ");
    const firstMonth = parseInt(parsedValues[0], 10);
    const secondMonth = parseInt(parsedValues[1], 10);

    const monthCategories = Object.freeze({
        1: 1,
        2: 0,
        3: 1,
        4: 2,
        5: 1,
        6: 2,
        7: 1,
        8: 1,
        9: 2,
        10: 1,
        11: 2,
        12: 1
    });

    if (monthCategories[firstMonth] === monthCategories[secondMonth]) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
