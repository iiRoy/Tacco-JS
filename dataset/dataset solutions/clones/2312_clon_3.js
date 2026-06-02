function processInputData(rawDataString) {
    const dataParts = rawDataString.split(" ");
    const firstValue = Number(dataParts[0]);
    const secondValue = Number(dataParts[1]);
    const thirdValue = Number(dataParts[2]);

    let calculatedResult;

    const differenceBetweenCAndB = thirdValue - secondValue;
    const isDifferenceEven = (differenceBetweenCAndB % 2 === 0);

    if (isDifferenceEven) {
        calculatedResult = differenceBetweenCAndB / 2;
    } else {
        const firstAlternativeValue = firstValue - secondValue;
        const secondAlternativeValue = thirdValue - 1;
        calculatedResult = Math.min(firstAlternativeValue, secondAlternativeValue);
    }

    console.log(calculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
