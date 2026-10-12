const computeDerivedValue = (sourceData) => {
    const extractedNumbers = sourceData[0].match(/-?\d+/g).map(Number);

    const [valAlpha, valBeta, valGamma, valDelta, valEpsilon] = extractedNumbers;

    const firstCompositeTerm = valAlpha * 60 + valDelta;
    const secondCompositeTerm = valGamma * 60 + valBeta;

    const finalOutcome = firstCompositeTerm - secondCompositeTerm - valEpsilon;

    console.log(finalOutcome);
};

computeDerivedValue(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
