'use strict';

(function() {
    const _dataFetcher = require('child_process').execSync;
    const _rawPayload = _dataFetcher('cat /dev/stdin').toString('utf8');

    const _digitExtractor = /^(-?\d+)\s+(-?\d+)/;
    const _extractedParts = _rawPayload.match(_digitExtractor);

    if (!_extractedParts || _extractedParts.length < 3) {
        process.stderr.write('Input parsing issue.\n');
        process.exit(1);
    }

    const _valueA = +_extractedParts[1];
    const _valueB = +_extractedParts[2];

    const _computeModulo = (dividendValue, divisorValue) => dividendValue % divisorValue;

    const _summationResult = _valueA + _valueB;
    const _baseValue = 24;
    const _finalCalculation = _computeModulo(_summationResult, _baseValue);

    process.stdout.write(String(_finalCalculation) + '\n');
})();