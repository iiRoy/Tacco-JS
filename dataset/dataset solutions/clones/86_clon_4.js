const rawTextualData = require('fs').readFileSync('/dev/stdin', 'utf8');

const analyzeSegmentPair = (lineData) => {
    const numericMeasurements = lineData.split(' ').map(s => Number(s) * 100000);

    const segmentOne = {
        origin: { horizon: numericMeasurements[0], vertical: numericMeasurements[1] },
        terminus: { horizon: numericMeasurements[2], vertical: numericMeasurements[3] }
    };
    const segmentTwo = {
        origin: { horizon: numericMeasurements[4], vertical: numericMeasurements[5] },
        terminus: { horizon: numericMeasurements[6], vertical: numericMeasurements[7] }
    };

    const deltaOneHorizon = segmentOne.terminus.horizon - segmentOne.origin.horizon;
    const deltaOneVertical = segmentOne.terminus.vertical - segmentOne.origin.vertical;
    const deltaTwoHorizon = segmentTwo.terminus.horizon - segmentTwo.origin.horizon;
    const deltaTwoVertical = segmentTwo.terminus.vertical - segmentTwo.origin.vertical;

    const isFirstNonVertical = deltaOneHorizon !== 0;
    const isSecondNonVertical = deltaTwoHorizon !== 0;

    let comparisonOutcome = "NO";

    if (isFirstNonVertical && isSecondNonVertical) {
        if (deltaOneVertical * deltaTwoHorizon === deltaTwoVertical * deltaOneHorizon) {
            comparisonOutcome = "YES";
        }
    }

    return comparisonOutcome;
};

const textualOutputLines = rawTextualData
    .trim()
    .split('\n')
    .slice(1)
    .map(analyzeSegmentPair);

textualOutputLines.forEach(outcome => console.log(outcome));