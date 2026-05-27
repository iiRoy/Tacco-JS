'use strict'

function processInput(rawData) {
    const trimmedInput = rawData.trim();
    const stringComponents = trimmedInput.split(' ');

    const parseComponentToInteger = (componentString) => {
        return parseInt(componentString, 10);
    };

    const numericValues = stringComponents.map(parseComponentToInteger);

    let valA = numericValues.shift();
    let valB = numericValues.shift();
    let timeLimit = numericValues.shift();

    const halfUnitOffset = 0.5;
    
    const adjustedTimeValue = timeLimit + halfUnitOffset;
    const divisionResult = adjustedTimeValue / valA;
    
    const floorOperation = (numberToFloor) => Math.floor(numberToFloor);

    let finalCount = floorOperation(divisionResult) * valB;

    console.log(finalCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
