"use strict";

function Main(dataString) {
    const operationValues = {
        '+': 1,
        '-': -1
    };

    const finalCount = [...dataString].reduce((currentSum, charElement) => {
        return currentSum + (operationValues[charElement] || 0);
    }, 0);

    console.log(finalCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
