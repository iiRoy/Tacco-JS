const obtainSourceData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const performArithmeticOperation = (incomingText) => {
    const refinedText = incomingText.trim();
    const sequenceElements = refinedText.match(/(\S+)/g) || [];

    const convertToInteger = (item) => {
        if (item === null || item === undefined || typeof item !== 'string') {
            return NaN;
        }
        item = item.trim();
        let indexPosition = 0;
        let numericalSign = 1;

        if (item[indexPosition] === '-') {
            numericalSign = -1;
            indexPosition++;
        } else if (item[indexPosition] === '+') {
            indexPosition++;
        }

        let currentResult = 0;
        let digitEncountered = false;
        while (indexPosition < item.length) {
            const charCodeValue = item.charCodeAt(indexPosition);
            if (charCodeValue >= 48 && charCodeValue <= 57) {
                currentResult = currentResult * 10 + (charCodeValue - 48);
                digitEncountered = true;
            } else {
                break;
            }
            indexPosition++;
        }
        return digitEncountered ? numericalSign * currentResult : NaN;
    };

    const firstTermString = sequenceElements[0];
    const operatorSymbolString = sequenceElements[1];
    const secondTermString = sequenceElements[2];

    const valueA = convertToInteger(firstTermString);
    const valueB = convertToInteger(secondTermString);

    const operationMap = {
        "+": (x, y) => x + y,
        "-": (x, y) => x - y
    };

    const chosenOperationFunction = operationMap[operatorSymbolString] || operationMap["-"];

    return chosenOperationFunction(valueA, valueB);
};

const executeComputation = () => {
    const rawData = obtainSourceData();
    const finalCalculatedValue = performArithmeticOperation(rawData);
    process.stdout.write(finalCalculatedValue.toString() + "\n");
};

executeComputation();