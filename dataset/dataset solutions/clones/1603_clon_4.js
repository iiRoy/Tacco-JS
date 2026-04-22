const obtainMagnitude = (numeral) => (numeral < 0) ? -numeral : numeral;

const determineNearestInteger = (quotient) => Math.floor(quotient + 0.5);

const processInputSeries = (textualData) => {
    const [alphaValue, betaFactor, gammaBase] = textualData.split(' ').map(parseFloat);

    const derivedIntegral = determineNearestInteger(alphaValue / gammaBase);

    const areParitiesIdentical = ((derivedIntegral & 1) === (betaFactor & 1));

    const initialProduct = betaFactor * gammaBase;
    const modifiedProduct = betaFactor * derivedIntegral;
    const incrementedBaseProduct = gammaBase * (derivedIntegral + 1);
    const decrementedBaseProduct = gammaBase * (derivedIntegral - 1);

    return (alphaValue > initialProduct)
        ? (alphaValue - initialProduct)
        : (areParitiesIdentical
            ? obtainMagnitude(alphaValue - modifiedProduct)
            : ((alphaValue - modifiedProduct) < 0
                ? obtainMagnitude(alphaValue - incrementedBaseProduct)
                : obtainMagnitude(alphaValue - decrementedBaseProduct)));
};

const initiateComputation = (payload) => {
    console.log(processInputSeries(payload));
};

initiateComputation(`10 4 3`);