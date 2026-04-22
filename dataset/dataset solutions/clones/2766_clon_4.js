const processInputData = (textualContent) => {
    const MODULUS_VALUE_CONST = 2019;

    const extractNumericEndpoints = (sourceText) => {
        const [firstLineContent] = sourceText.split('\n');
        const [startPoint, endPoint] = firstLineContent.split(' ').map(Number);
        return { start: startPoint, end: endPoint };
    };

    const { start: initialNumber, end: finalNumber } = extractNumericEndpoints(textualContent);

    const productOfBounds = initialNumber * finalNumber;
    if (productOfBounds <= MODULUS_VALUE_CONST) {
        return (initialNumber * (initialNumber + 1));
    }

    const spanOfRange = finalNumber - initialNumber;
    if (spanOfRange >= MODULUS_VALUE_CONST) {
        return 0;
    }

    const generateAllProductsModulo = (firstLimit, secondLimit, divisor) => {
        const createNumericSequence = (lower, upper) =>
            Array.from({ length: upper - lower + 1 }, (_, index) => lower + index);

        return createNumericSequence(firstLimit, secondLimit - 1)
            .flatMap(factorA =>
                createNumericSequence(factorA + 1, secondLimit)
                    .map(factorB => (factorA * factorB) % divisor)
            );
    };

    const moduloProductsArray = generateAllProductsModulo(initialNumber, finalNumber, MODULUS_VALUE_CONST);

    const calculateOverallMinimum = (resultsCollection) => {
        if (resultsCollection.some(val => val === 0)) {
            return 0;
        }

        return resultsCollection.reduce((currentMinVal, itemVal) => Math.min(currentMinVal, itemVal), MODULUS_VALUE_CONST - 1);
    };

    const computedMinimum = calculateOverallMinimum(moduloProductsArray);

    return computedMinimum;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));