function processInputData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const stringNumbers = trimmedInput.split(" ");

    const parsedNumbers = stringNumbers.map(Number);

    const totalElements = parsedNumbers[0];
    const splitPoint = parsedNumbers[1];
    const initialValue = parsedNumbers[2];

    const getAlternateValue = (baseVal) => {
        if (baseVal === 1) {
            return baseVal + 1;
        } else {
            return baseVal - 1;
        }
    };

    const outputParts = [];

    for (let currentIteration = 1; currentIteration <= totalElements; currentIteration++) {
        let valueToAppend;

        if (currentIteration <= splitPoint) {
            valueToAppend = initialValue;
        } else {
            valueToAppend = getAlternateValue(initialValue);
        }
        outputParts.push(valueToAppend);
    }

    const finalResultString = outputParts.join(" ");

    console.log(finalResultString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
