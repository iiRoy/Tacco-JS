const n = {};

n["AtCoder.ABC120.A"] = {};

n["AtCoder.ABC120.A"].solve = function(inputString) {
    const processedInput = inputString.trim();
    const segmentArray = processedInput.split(' ');

    if (segmentArray.length !== 3) {
        throw new Error("invalid line");
    }

    const firstValue = parseInt(segmentArray[0], 10);
    if (Number.isNaN(firstValue)) {
        throw new Error("a");
    }

    const secondValue = parseInt(segmentArray[1], 10);
    if (Number.isNaN(secondValue)) {
        throw new Error("b");
    }

    const thirdValue = parseInt(segmentArray[2], 10);
    if (Number.isNaN(thirdValue)) {
        throw new Error("c");
    }

    const computedResult = Math.min(Math.floor(secondValue / firstValue), thirdValue);

    return String(computedResult);
};

n.Main = {};

n.Main.main = function() {
    const fileSystemAccess = require('fs');
    const standardInputContent = fileSystemAccess.readFileSync('/dev/stdin', { encoding: 'utf8' });

    let programResult;
    try {
        programResult = n["AtCoder.ABC120.A"].solve(standardInputContent);
    } catch (operationError) {
        throw operationError;
    }

    console.log(programResult);
};

n.Main.main();
