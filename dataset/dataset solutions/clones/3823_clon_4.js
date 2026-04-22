const processStringIntoNumbers = (sourceContent) => {
    const rawDigits = sourceContent.trim().split(' ');
    let parsedValues = [];
    for (const segment of rawDigits) {
        parsedValues.push(parseInt(segment, 10));
    }

    let structuredData = {};
    structuredData.first = parsedValues[0];
    structuredData.second = parsedValues[1];
    structuredData.third = parsedValues[2];
    structuredData.fourth = parsedValues[3];
    
    return structuredData;
};

const assessConditions = (inputObject) => {
    const val1 = inputObject.first;
    const val2 = inputObject.second;
    const val3 = inputObject.third;
    const val4 = inputObject.fourth;

    const withinRange = (valA, valB, limit) => (valA - valB) <= limit;

    const pathA = withinRange(val1, val3, val4);
    const pathB = withinRange(val1, val2, val4);
    const pathC = withinRange(val2, val3, val4);

    return (pathA || (pathB && pathC)) ? Math.abs(val1) : 'No';
};

const runComputation = (rawInputText) => {
    const dataSet = processStringIntoNumbers(rawInputText);
    const finalOutcome = assessConditions(dataSet);
    console.log(finalOutcome);
};

runComputation(require("fs").readFileSync("/dev/stdin","utf8"));