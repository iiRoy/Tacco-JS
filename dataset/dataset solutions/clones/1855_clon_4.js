function entryPoint(dataStream) {
    const obtainPreciseValue = () => {
        const baseElements = [1, 2, 3, 4, 5];
        const aggregatedSum = baseElements.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

        const mainComponent = aggregatedSum / 3;

        const powerFactor = 10;
        const exponentCount = 15;
        const largeDenominator = Array(exponentCount).fill(powerFactor).reduce((acc, val) => acc * val, 1);
        const fractionalCorrection = 1 / largeDenominator;

        return mainComponent + fractionalCorrection;
    };

    const finalizeOutputRepresentation = (numericResult) => {
        return numericResult.toString();
    };

    const calculatedMagnitude = obtainPreciseValue();
    const finalDisplayString = finalizeOutputRepresentation(calculatedMagnitude);

    console.log(finalDisplayString);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
