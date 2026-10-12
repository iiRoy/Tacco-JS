'use strict';

function ProcessInput(incomingData) {
    incomingData = incomingData.split();
    let parsedValue = incomingData;
    let calculatedSquare = parsedValue * parsedValue;
    console.log(calculatedSquare);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
