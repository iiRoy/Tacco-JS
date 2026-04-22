const ingestData = () => {
    return Number(process.stdin.readFileSync(0, 'utf8').trim());
};

const broadcastResult = (value) => {
    process.stdout.write(String(value) + '\n');
};

const processMonetaryValue = (givenValue) => {
    const taxRateAsFractionNumerator = 108;
    const taxRateAsFractionDenominator = 100;
    const effectiveTaxRate = taxRateAsFractionNumerator / taxRateAsFractionDenominator;

    const estimatedBase = givenValue / effectiveTaxRate;
    
    const searchLowerBound = Math.max(0, Math.floor(estimatedBase) - 2);
    const searchUpperBound = Math.ceil(estimatedBase) + 2;

    let finalDeterminedValue = null;

    const recomputedTaxedValue = givenValue / effectiveTaxRate * effectiveTaxRate;
    const decisionMetricA = (Math.floor(recomputedTaxedValue) === givenValue);
    const decisionMetricB = (Math.ceil(recomputedTaxedValue) === givenValue);

    for (let currentCandidate = searchLowerBound; currentCandidate <= searchUpperBound; currentCandidate++) {
        const grossAmount = currentCandidate * effectiveTaxRate;
        const roundedDownGross = Math.floor(grossAmount);
        const roundedUpGross = Math.ceil(grossAmount);

        if (roundedDownGross === givenValue || roundedUpGross === givenValue) {
            if (decisionMetricA && (currentCandidate === Math.ceil(estimatedBase))) {
                finalDeterminedValue = currentCandidate;
                break;
            }
            if (decisionMetricB && (currentCandidate === Math.floor(estimatedBase))) {
                finalDeterminedValue = currentCandidate;
                break;
            }
        }
    }
    
    return finalDeterminedValue !== null ? finalDeterminedValue : ":(";
};

const rawInputData = ingestData();
const outcome = processMonetaryValue(rawInputData);
broadcastResult(outcome);