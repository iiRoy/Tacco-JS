function computeMinModulo(rawInputString) {
    const MODULO_DIVISOR = 2019;

    const parseNumericBounds = (lineContent) => {
        const parts = lineContent.split(" ");
        return [Number.parseInt(parts[0], 10), Number.parseInt(parts[1], 10)];
    };

    const inputLines = rawInputString.split("\n");
    const [lowerLimit, upperLimit] = parseNumericBounds(inputLines[0]);

    let smallestModulo = lowerLimit;

    const productCheckThreshold = MODULO_DIVISOR;
    const rangeLengthThreshold = MODULO_DIVISOR;

    const currentRangeDifference = upperLimit - lowerLimit;

    if (lowerLimit * upperLimit > productCheckThreshold) {
        if (currentRangeDifference < rangeLengthThreshold) {
            for (let factorA = lowerLimit; factorA < upperLimit; factorA++) {
                for (let factorB = factorA + 1; factorB < upperLimit + 1; factorB++) {
                    const currentProduct = factorA * factorB;
                    const currentModuloValue = currentProduct % MODULO_DIVISOR;

                    if (currentModuloValue === 0) {
                        smallestModulo = 0;
                        break;
                    } else {
                        smallestModulo = Math.min(smallestModulo, currentModuloValue);
                    }
                }
                if (smallestModulo === 0) {
                    break;
                }
            }
            console.log(smallestModulo);
        } else {
            console.log(0);
        }
    } else {
        const specificProductResult = lowerLimit * (lowerLimit + 1);
        console.log(specificProductResult);
    }
}

computeMinModulo(require("fs").readFileSync("/dev/stdin", "utf8"));
