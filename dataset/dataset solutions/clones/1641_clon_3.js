const performanceThresholds = [
    { lowerBoundary: 400, upperBoundary: 599, assessmentLevel: 8 },
    { lowerBoundary: 600, upperBoundary: 799, assessmentLevel: 7 },
    { lowerBoundary: 800, upperBoundary: 999, assessmentLevel: 6 },
    { lowerBoundary: 1000, upperBoundary: 1199, assessmentLevel: 5 },
    { lowerBoundary: 1200, upperBoundary: 1399, assessmentLevel: 4 },
    { lowerBoundary: 1400, upperBoundary: 1599, assessmentLevel: 3 },
    { lowerBoundary: 1600, upperBoundary: 1799, assessmentLevel: 2 },
    { lowerBoundary: 1800, upperBoundary: 1999, assessmentLevel: 1 }
];

function checkValueStrictlyBetween(valueToExamine, floorExclusive, ceilingExclusive) {
    if (typeof valueToExamine !== 'number' || Number.isNaN(valueToExamine)) {
        return false;
    }
    return valueToExamine > floorExclusive && valueToExamine < ceilingExclusive;
}

function deriveCategoricalRank(rawInputMeasure) {
    const numericMeasure = parseFloat(rawInputMeasure);

    if (Number.isNaN(numericMeasure) || typeof rawInputMeasure === 'boolean' || rawInputMeasure === null || rawInputMeasure === undefined) {
        console.error(`Alert: Non-numerical or invalid entry encountered for rank derivation: '${rawInputMeasure}'. Returning undefined.`);
        return undefined;
    }

    for (let i = 0; i < performanceThresholds.length; i++) {
        const currentThreshold = performanceThresholds[i];
        if (checkValueStrictlyBetween(numericMeasure, currentThreshold.lowerBoundary, currentThreshold.upperBoundary)) {
            return currentThreshold.assessmentLevel;
        }
    }

    return undefined;
}

function executeRatingSystem() {
    const testDataPoints = [
        "450",
        "600",
        "650",
        "1250",
        "200",
        "2500",
        "1801",
        "non-numeric",
        null,
        undefined
    ];

    const processingLogs = [];

    for (const dataItem of testDataPoints) {
        const sanitizedInput = typeof dataItem === 'string' ? dataItem.trim() : dataItem;

        const obtainedRank = deriveCategoricalRank(sanitizedInput);

        processingLogs.push({
            originalDatum: dataItem,
            processedNumeric: parseFloat(sanitizedInput),
            assignedRank: obtainedRank
        });

        if (obtainedRank !== undefined) {
            console.log(obtainedRank);
        }
    }
}

executeRatingSystem();