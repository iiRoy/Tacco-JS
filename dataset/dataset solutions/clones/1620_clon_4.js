function assessNumericValue(incomingData) {
    const minimumAcceptable = 30;
    const interpretedValue = Number(incomingData.trim());
    const outcomeLexicon = {
        'true': 'Proceed',
        'false': 'Halt'
    };
    const comparisonResultKey = String(interpretedValue >= minimumAcceptable);
    process.stdout.write(outcomeLexicon[comparisonResultKey]);
}

const rawInputContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
assessNumericValue(rawInputContent);