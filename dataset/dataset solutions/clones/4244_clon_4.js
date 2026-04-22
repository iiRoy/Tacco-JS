const convertToNumericArray = (textSegment) => textSegment.split(' ').map(Number);

const determineAbsoluteDifference = (valA, valB) => {
    if (valA === undefined || valB === undefined) {
        return NaN;
    }
    return (valA > valB) ? (valA - valB) : (valB - valA);
};

const identifyLargestValue = (...valueSet) => {
    let greatestEncountered = -Infinity;
    let containsInvalid = false;
    for (let idx = 0; idx < valueSet.length; idx++) {
        const itemValue = valueSet[idx];
        if (Number.isNaN(itemValue)) {
            containsInvalid = true;
        } else if (itemValue > greatestEncountered) {
            greatestEncountered = itemValue;
        }
    }
    return containsInvalid ? Number.NaN : greatestEncountered;
};

const performComputation = (sourceMaterial) => {
    const contentLines = sourceMaterial.split('\n');
    const firstLineValues = contentLines[0];
    const secondLineValues = contentLines[1];

    const [countOfElements, markerZ, markerW] = convertToNumericArray(firstLineValues);
    const dataSequence = convertToNumericArray(secondLineValues);

    const calculationA = determineAbsoluteDifference(markerZ, markerW);
    const calculationB = determineAbsoluteDifference(dataSequence[countOfElements - 1], dataSequence[countOfElements - 2]);
    const calculationC = determineAbsoluteDifference(dataSequence[countOfElements - 1], markerW);

    return identifyLargestValue(calculationA, calculationB, calculationC);
};

const runApplication = (dataInputSource) => {
    const acquiredText = dataInputSource();
    const finalOutcome = performComputation(acquiredText);
    console.log(finalOutcome);
};

runApplication(() => require('fs').readFileSync('/dev/stdin', 'utf8'));