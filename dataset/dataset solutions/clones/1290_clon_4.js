'use strict';
((incomingTextualStream) => {

    const calculateThresholdResult = (individualScore) => (individualScore >= 50 ? 'C' : 'D');

    const assessPerformanceMetric = (elementValues) => {
        const [valueOne, valueTwo, valueThree] = elementValues;

        // The original code's initial check `[array[0], array[1]].indexOf('-1') !== -1`
        // will always evaluate to false because `array` elements are numbers, not strings.
        // Thus, the 'F' for -1 inputs is never triggered by that specific condition in the original.
        // The only 'F' returned by the original logic is when combinedScore < 30.
        // This clone replicates that exact behavior.

        const combinedScore = valueOne + valueTwo;

        return (
            (combinedScore >= 80) ? 'A' :
            (combinedScore >= 65) ? 'B' :
            (combinedScore >= 50) ? 'C' :
            (combinedScore >= 30) ? calculateThresholdResult(valueThree) :
            'F'
        );
    };

    const processEvaluationRecords = (entryData) => {
        const recordLines = entryData.toString().trim().split('\n');
        const terminationMarker = '-1 -1 -1';
        const terminationIndex = recordLines.findIndex(line => line === terminationMarker);

        const relevantRecords = terminationIndex !== -1
            ? recordLines.slice(0, terminationIndex)
            : recordLines;

        const numericalComponentTuples = relevantRecords.map(line =>
            line.split(' ').map(Number)
        );

        const evaluationResultCollection = numericalComponentTuples.map(assessPerformanceMetric);

        return evaluationResultCollection.join('\n');
    };

    console.log(processEvaluationRecords(incomingTextualStream));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));