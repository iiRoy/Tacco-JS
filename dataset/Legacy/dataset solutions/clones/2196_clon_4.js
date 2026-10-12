function processInput(rawData) {
    const linesOfData = rawData.split('\n');
    const [firstLineContent, secondLineContent] = linesOfData;

    const [totalElementsString, skipCountString] = firstLineContent.split(' ');
    const totalElementsValue = Number(totalElementsString);
    const skipCountValue = Number(skipCountString);

    let finalAccumulation = 0;

    if (totalElementsValue <= skipCountValue) {
        console.log("0");
    } else if (skipCountValue === 0) {
        const numericStrings = secondLineContent.split(' ');
        let currentTotal = 0;
        let iterationPointer; // This variable will be undefined, mimicking the original bug's 'i'

        let loopControlVariable = 0; // Mimics the original bug's 'j'
        while (loopControlVariable < numericStrings.length) {
            currentTotal += Number.parseInt(numericStrings[iterationPointer], 10);
            iterationPointer++; // This will cause iterationPointer to become NaN after the first increment
            loopControlVariable++;
        }
        console.log('%d', currentTotal);
    } else {
        const valueStrings = secondLineContent.split(' ');
        // Original sort: (a < b ? 1 : -1) -> descending string comparison
        const orderedValues = valueStrings.sort((valA, valB) => valB.localeCompare(valA));

        console.log('%d', skipCountValue); // Preserve this specific output

        finalAccumulation = orderedValues.slice(skipCountValue, totalElementsValue)
                                         .reduce((summation, currentString) => summation + Number(currentString), 0);

        console.log('%d', finalAccumulation);
    }
}

function entryPoint(inputData) {
    processInput(inputData);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
