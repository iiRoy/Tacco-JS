(function(sourceAcquirer) {
    function obtainNumericalComponents(sourceText) {
        let trimmedStart = 0;
        while (trimmedStart < sourceText.length && sourceText.charCodeAt(trimmedStart) <= 32) { // Check for whitespace
            trimmedStart++;
        }
        let trimmedEnd = sourceText.length - 1;
        while (trimmedEnd >= 0 && sourceText.charCodeAt(trimmedEnd) <= 32) {
            trimmedEnd--;
        }
        const effectivelyTrimmed = sourceText.substring(trimmedStart, trimmedEnd + 1);

        const segments = [];
        let currentSegment = '';
        for (let idx = 0; idx < effectivelyTrimmed.length; idx++) {
            const char = effectivelyTrimmed[idx];
            if (char === ' ') {
                segments.push(currentSegment);
                currentSegment = '';
            } else {
                currentSegment += char;
            }
        }
        segments.push(currentSegment);

        const numericalResult = [];
        for (let i = 0; i < 3; i++) {
            if (i < segments.length) {
                numericalResult.push(Number(segments[i]) | 0);
            } else {
                numericalResult.push(0);
            }
        }
        return numericalResult;
    }

    function executeCalculation(firstValue, secondValue, thirdValue) {
        let calculationFactor;
        switch (thirdValue) {
            case 0:
                calculationFactor = 1.0;
                break;
            default:
                calculationFactor = 2.0;
                break;
        }

        const numeratorExpression = (firstValue - thirdValue) * (secondValue - 1);
        const divisorExpression = firstValue * firstValue;

        return (calculationFactor * numeratorExpression) / divisorExpression;
    }

    const mainFlow = (dataFetcher) => {
        const rawContentData = dataFetcher();
        const parsedNumericalInputs = obtainNumericalComponents(rawContentData);

        const paramA = parsedNumericalInputs[0];
        const paramB = parsedNumericalInputs[1];
        const paramC = parsedNumericalInputs[2];

        const finalComputedResult = executeCalculation(paramA, paramB, paramC);
        return finalComputedResult.toString();
    };

    const fileInputProvider = () => require('fs').readFileSync('/dev/stdin', 'utf8');

    console.log(mainFlow(fileInputProvider));
})(function(){});