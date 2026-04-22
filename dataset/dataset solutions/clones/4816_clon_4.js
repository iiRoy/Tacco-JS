const emitResult = (dataValue) => process.stdout.write(String(dataValue) + '\n');

const executeSolution = (inputBlob) => {
    const formattedInput = inputBlob.trim();
    const lines = formattedInput.split('\n');

    const sequenceLength = parseInt(lines[0], 10);
    const parsedNumbers = lines[1].split(' ').map(Number);

    const elementFrequencies = new Map();
    parsedNumbers.forEach(item => {
        const currentFrequency = elementFrequencies.get(item);
        if (currentFrequency === undefined) {
            elementFrequencies.set(item, 1);
        } else if (currentFrequency === 1) {
            elementFrequencies.set(item, 2);
        }
        // If currentFrequency is 2, it remains 2, mimicking original logic.
    });

    const distinctSortedElements = Array.from(new Set(parsedNumbers)).sort((a, b) => a - b);

    let powerExponent = 0;
    let isPermittedConfiguration = true;

    if (sequenceLength % 2 !== 0) { // Odd sequence length
        if (distinctSortedElements[0] !== 0) {
            isPermittedConfiguration = false;
        }
        if (elementFrequencies.get(0) !== 1) {
            isPermittedConfiguration = false;
        }
        for (let k = 1; k < distinctSortedElements.length; k++) {
            const currentElement = distinctSortedElements[k];
            if (elementFrequencies.get(currentElement) !== 2) {
                isPermittedConfiguration = false;
                break;
            }
        }
        if (distinctSortedElements.length !== (sequenceLength - 1) / 2 + 1) {
            isPermittedConfiguration = false;
        }

        if (isPermittedConfiguration) {
            powerExponent = (sequenceLength - 1) / 2;
        }

    } else { // Even sequence length
        for (let k = 0; k < distinctSortedElements.length; k++) {
            const currentElement = distinctSortedElements[k];
            if (elementFrequencies.get(currentElement) !== 2) {
                isPermittedConfiguration = false;
                break;
            }
        }
        if (distinctSortedElements.length !== sequenceLength / 2) {
            isPermittedConfiguration = false;
        }

        if (isPermittedConfiguration) {
            powerExponent = sequenceLength / 2;
        }
    }

    if (!isPermittedConfiguration) {
        emitResult("0");
    } else {
        emitResult(1 << powerExponent); // Calculate 2 to the power of powerExponent using bit shift
    }
};

const acquireSystemInput = () => {
    const content = require("fs").readFileSync("/dev/stdin", "utf8");
    executeSolution(content);
};

acquireSystemInput();