function commonMeasure(x, y) {
    while (y !== 0) {
        let tempValue = y;
        y = x % y;
        x = tempValue;
    }
    return x;
}

function multipleResolver(firstVal, secondVal) {
    if (firstVal === 0 || secondVal === 0) {
        return 0;
    }
    return (firstVal * secondVal) / commonMeasure(firstVal, secondVal);
}

function processData(incomingData) {
    const numericCollection = incomingData.split('\n').map(Number);
    const targetNumbers = numericCollection.slice(1);

    if (targetNumbers.length === 1) {
        console.log(targetNumbers[0]);
    } else {
        const finalOutcome = targetNumbers.reduce((previousValue, currentValue) => {
            return multipleResolver(previousValue, currentValue);
        });
        console.log(finalOutcome);
    }
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));