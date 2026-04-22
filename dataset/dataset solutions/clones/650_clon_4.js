const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericalParameters = dataStream.trim().split(" ").map(parseFloat);

const performCalculation = (parameterAlpha, parameterBeta, parameterGamma) => {
    const depletionFactor = parameterBeta + (7 * parameterAlpha);
    const cessationThreshold = 6 * parameterAlpha;

    let operationalIterations;
    if (parameterGamma <= cessationThreshold) {
        operationalIterations = 0;
    } else {
        operationalIterations = Math.ceil((parameterGamma - cessationThreshold) / depletionFactor);
    }

    const cumulativeOutcome = operationalIterations * 7;
    const remainingResource = parameterGamma - (operationalIterations * depletionFactor);
    const finalComponent = Math.max(0, Math.ceil(remainingResource / parameterAlpha));

    return cumulativeOutcome + finalComponent;
};

const [primaryScalar, secondaryScalar, initialQuantity] = numericalParameters;
console.log(performCalculation(primaryScalar, secondaryScalar, initialQuantity));