'use strict';
(function(inputContent) {
    const sourceLines = inputContent.split('\n');
    const terminationMarker = '0';

    let activeSegments = [];
    for (const line of sourceLines) {
        if (line === terminationMarker) {
            break;
        }
        activeSegments.push(line);
    }

    const assessVariation = (numericalValues, metricCount) => {
        const relevantValues = numericalValues.slice(0, metricCount);
        let runningTotal = 0;
        for (const val of relevantValues) {
            runningTotal += val;
        }
        const centralTendency = runningTotal / metricCount;

        let sumOfSquaredDifferences = 0;
        for (const val of relevantValues) {
            const individualDifference = val - centralTendency;
            sumOfSquaredDifferences += (individualDifference * individualDifference);
        }

        const variance = sumOfSquaredDifferences / metricCount;
        return Math.sqrt(variance).toFixed(8);
    };

    const processInputSegments = (segments, processedOutputs = []) => {
        if (segments.length < 2) {
            return processedOutputs.join('\n');
        }

        const currentSampleSize = parseInt(segments[0], 10);
        const currentMeasurements = segments[1].split(' ').map(Number);

        const calculatedDeviation = assessVariation(currentMeasurements, currentSampleSize);
        processedOutputs.push(calculatedDeviation);

        return processInputSegments(segments.slice(2), processedOutputs);
    };

    const finalOutput = processInputSegments(activeSegments);
    console.log(finalOutput);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));