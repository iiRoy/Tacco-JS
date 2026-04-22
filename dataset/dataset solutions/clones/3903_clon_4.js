const processIncomingData = (fullInput) => {
    const parts = fullInput.split(/\s|\n/).filter(val => val.length > 0);
    let currentPosition = 0;
    const getNextInt = () => parseInt(parts[currentPosition++], 10);
    const getMultipleInts = (howMany) => Array.from({ length: howMany }, getNextInt);
    return { getNextInt, getMultipleInts };
};

const executeLogic = (dataInput) => {
    const dataParser = processIncomingData(dataInput);
    const totalItems = dataParser.getNextInt();
    const initialValues = dataParser.getMultipleInts(totalItems);

    if (totalItems === 0) {
        return "0 0";
    }

    const sortedDescending = [...initialValues].sort((x, y) => y - x);
    sortedDescending.push(0);

    const primaryValue = sortedDescending[0];
    const midpointTarget = Math.floor(primaryValue / 2);

    let candidateA, candidateB;

    const valuesToSearch = sortedDescending.slice(1);
    const firstSmallerRelativeIndex = valuesToSearch.findIndex(elem => elem < midpointTarget);

    if (firstSmallerRelativeIndex === -1) {
        candidateA = sortedDescending[sortedDescending.length - 2];
        candidateB = sortedDescending[sortedDescending.length - 1];
    } else {
        const firstSmallerAbsoluteIndex = 1 + firstSmallerRelativeIndex;
        candidateA = sortedDescending[firstSmallerAbsoluteIndex - 1];
        candidateB = sortedDescending[firstSmallerAbsoluteIndex];
    }

    const proximityA = Math.abs(midpointTarget - candidateA);
    const proximityB = Math.abs(midpointTarget - candidateB);

    const finalSelection = (proximityA <= proximityB) ? candidateA : candidateB;

    return `${primaryValue} ${finalSelection}`;
};

const initiateOperation = () => {
    const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
    console.log(executeLogic(sourceData));
};

initiateOperation();