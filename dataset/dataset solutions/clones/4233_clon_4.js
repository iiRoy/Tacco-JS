const digestInputLine = (rawText) => {
    return rawText.trim().split(" ").map(Number);
};

const decomposeQuantity = (totalSpan, stride) => {
    if (stride === 0) {
        if (totalSpan === 0) return { fullIterations: NaN, leftoverPortion: NaN };
        if (totalSpan > 0) return { fullIterations: Infinity, leftoverPortion: Infinity };
        return { fullIterations: -Infinity, leftoverPortion: -Infinity };
    }

    let fullIterations = 0;
    let workingValue = totalSpan;

    if (totalSpan >= 0) {
        while (workingValue >= stride) {
            workingValue -= stride;
            fullIterations++;
        }
    } else {
        while (workingValue < 0) {
            workingValue += stride;
            fullIterations--;
        }
    }

    return { fullIterations, leftoverPortion: workingValue };
};

const assessSituation = (sourceMaterial) => {
    const [alpha, beta, gamma] = digestInputLine(sourceMaterial);

    const baseExtent = alpha - (gamma << 1);
    const unitMeasure = beta + gamma;

    const { fullIterations, leftoverPortion } = decomposeQuantity(baseExtent, unitMeasure);

    const thresholdComponent = beta;

    const finalTally = fullIterations + (leftoverPortion >= thresholdComponent ? 1 : 0);

    console.log(finalTally);
};

assessSituation(require('fs').readFileSync('/dev/stdin', 'utf8'));