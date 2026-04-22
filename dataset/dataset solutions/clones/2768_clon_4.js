(function (sourceTextualData) {
    const MOD_VAL = 2019;

    const retrieveNumericBounds = (rawContent) => {
        const contentLines = rawContent.split('\n');
        const firstLineSegments = contentLines[0].split(' ');
        return {
            initialPoint: parseInt(firstLineSegments[0], 10),
            terminalPoint: parseInt(firstLineSegments[1], 10)
        };
    };

    const { initialPoint: startingNumber, terminalPoint: endingNumber } = retrieveNumericBounds(sourceTextualData);

    const testForZeroResult = (start, end, divisor) => {
        const span = end - start;
        const containsMultiple = Math.floor(end / divisor) > Math.floor((start - 1) / divisor);
        return span >= divisor || containsMultiple;
    };

    const computeMinimumProductModulo = (start, end, divisor) => {
        const numberSequence = Array.from({ length: end - start + 1 }, (_, index) => start + index);
        
        const allPairProducts = numberSequence.flatMap((firstElement, firstIndex) =>
            numberSequence.slice(firstIndex + 1).map(secondElement => {
                const remainderA = firstElement % divisor;
                const remainderB = secondElement % divisor;
                return (remainderA * remainderB) % divisor;
            })
        );
        
        return allPairProducts.reduce((currentLowest, evaluatedValue) => Math.min(currentLowest, evaluatedValue), Infinity);
    };

    const processingDecisionTree = [
        {
            criterion: (s, e, d) => testForZeroResult(s, e, d),
            outcomeProducer: () => 0
        },
        {
            criterion: (s, e, d) => (e - s === 1),
            outcomeProducer: (s, e, d) => s % d 
        },
        {
            criterion: (s, e, d) => true, 
            outcomeProducer: (s, e, d) => computeMinimumProductModulo(s, e, d)
        }
    ];

    let finalCalculatedValue;

    for (const rule of processingDecisionTree) {
        if (rule.criterion(startingNumber, endingNumber, MOD_VAL)) {
            finalCalculatedValue = rule.outcomeProducer(startingNumber, endingNumber, MOD_VAL);
            break; 
        }
    }

    console.log(finalCalculatedValue);

})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);