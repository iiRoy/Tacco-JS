process.stdin.setEncoding('utf-8');

process.stdin.on('data', (incomingStreamData) => {
    const processedLine = String(incomingStreamData).replace(/[\r\n]+/g, '').trim();
    const componentStrings = processedLine.split(' ');

    const primaryComponent = Number.parseInt(componentStrings[0], 10);
    const secondaryComponent = Number.parseInt(componentStrings[1], 10);
    const tertiaryComponent = Number.parseInt(componentStrings[2], 10);

    if (primaryComponent === -1 && secondaryComponent === -1 && tertiaryComponent === -1) {
        process.exit(0);
    }

    const determineFinalAppraisal = (valueA, valueB, valueC) => {
        const adjustedValueA = valueA === -1 ? 0 : valueA;
        const adjustedValueB = valueB === -1 ? 0 : valueB;

        const cumulativeScore = adjustedValueA + adjustedValueB;

        const assessmentCriteria = [
            { lowerBound: 80, symbol: "A" },
            { lowerBound: 65, symbol: "B" },
            { lowerBound: 50, symbol: "C" },
            { lowerBound: 30, symbol: "D_OR_C" }
        ];

        for (const criterion of assessmentCriteria) {
            if (cumulativeScore >= criterion.lowerBound) {
                if (criterion.symbol === "D_OR_C") {
                    return valueC >= 50 ? "C" : "D";
                }
                return criterion.symbol;
            }
        }
        return "F";
    };

    const outcomeIndicator = determineFinalAppraisal(primaryComponent, secondaryComponent, tertiaryComponent);
    console.log(outcomeIndicator);
});