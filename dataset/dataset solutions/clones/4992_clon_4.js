(function() {
    const fileAccessUtility = require('node:fs');
    const rawInputContent = fileAccessUtility.readFileSync('/dev/stdin', { encoding: 'utf8' });

    const trimmedInputContent = rawInputContent.trim();
    const dataLines = trimmedInputContent.split('\n');

    const parameterAlpha = Number(dataLines[0]);
    const parameterBeta = Number(dataLines[1]);
    const parameterGamma = Number(dataLines[2]);
    const parameterDelta = Number(dataLines[3]);

    let baseComputation = parameterBeta * parameterGamma;
    let additionalCharge = 0;

    let differenceMetric = parameterAlpha - parameterBeta;
    if (differenceMetric > 0) {
        additionalCharge = differenceMetric * parameterDelta;
    }

    const finalResult = baseComputation + additionalCharge;

    process.stdout.write(String(finalResult) + '\n');
})();