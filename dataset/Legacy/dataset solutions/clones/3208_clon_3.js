function processInputData(rawDataString) {
    let parsedValues = rawDataString.split(' ');

    const initialValueK = parseInt(parsedValues[0], 10);
    const valueA = parseInt(parsedValues[1], 10);
    const valueB = parseInt(parsedValues[2], 10);

    const differenceD = valueB - valueA;
    const effectiveK = initialValueK - valueA;

    let finalResult;
    const baseCaseValue = initialValueK + 1;

    if (effectiveK < 2 || differenceD < 3) {
        finalResult = baseCaseValue;
    } else {
        const isEffectiveKEven = (effectiveK % 2 === 0);

        if (isEffectiveKEven) {
            finalResult = valueA + (effectiveK * differenceD / 2) + 1;
        } else {
            finalResult = valueA + ((effectiveK + 1) * differenceD / 2);
        }
    }

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
