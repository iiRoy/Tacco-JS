const processInput = (rawData) => {
    const trimmedData = rawData.trim();
    const spaceDelimiterPosition = trimmedData.indexOf(' ');

    let firstNumericString = '';
    let secondNumericString = '';

    for (let i = 0; i < spaceDelimiterPosition; i++) {
        firstNumericString += trimmedData[i];
    }
    for (let i = spaceDelimiterPosition + 1; i < trimmedData.length; i++) {
        secondNumericString += trimmedData[i];
    }

    const numericOperands = [Number(firstNumericString), Number(secondNumericString)];

    const computedResult = numericOperands.reduce((accumulator, currentElement, elementIndex) => {
        if (elementIndex === 0) {
            return currentElement;
        } else {
            return accumulator - currentElement;
        }
    });

    console.log(computedResult);
};

processInput(require("fs").readFileSync("/dev/stdin","utf8"));
