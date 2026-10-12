function processInputData(rawData) {
    const parsedNumbers = rawData.split(' ').map(val => parseInt(val, 10));

    const orderedValues = [...parsedNumbers].sort((a, b) => b - a);

    const firstVal = orderedValues[0];
    const secondVal = orderedValues[1];
    const thirdVal = orderedValues[2];

    const secondValDigits = String(secondVal).length;
    const mergedValue = firstVal * Math.pow(10, secondValDigits) + secondVal;

    const finalSum = mergedValue + thirdVal;

    console.log(finalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
