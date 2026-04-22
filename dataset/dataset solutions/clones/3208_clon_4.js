const obtainNumericalValue = (strInput) => Number(strInput);

const determineFinalCount = (limitValue, initialValue, rateValue) => {
    const rateDifference = rateValue - initialValue;
    const limitOffset = limitValue - initialValue;

    if (limitOffset < 2 || rateDifference < 3) {
        return limitValue + 1;
    } else {
        const halfOffset = Math.floor(limitOffset / 2);
        const offsetParity = limitOffset % 2;

        if (offsetParity === 0) { // limitOffset is even
            return initialValue + halfOffset * rateDifference + 1;
        } else { // limitOffset is odd
            return initialValue + (halfOffset + 1) * rateDifference;
        }
    }
};

const processInputData = (rawTextContent) => {
    const segments = rawTextContent.split(' ');
    const valueOne = obtainNumericalValue(segments[0]);
    const valueTwo = obtainNumericalValue(segments[1]);
    const valueThree = obtainNumericalValue(segments[2]);

    const calculatedResult = determineFinalCount(valueOne, valueTwo, valueThree);
    console.log(calculatedResult);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));