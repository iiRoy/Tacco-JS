'use strict';

const processCoordinates = (textualData) => {
    const extractNumericValues = (rawString) => {
        return rawString.split(/\s+/).map(Number);
    };

    const numericals = extractNumericValues(textualData);

    const dimension = numericals[0];
    const firstOrigin = numericals[1];
    const secondOrigin = numericals[2];

    const firstIntervalStart = firstOrigin;
    const firstIntervalEnd = firstOrigin + dimension;
    const secondIntervalStart = secondOrigin;
    const secondIntervalEnd = secondOrigin + dimension;

    const separation = Math.max(
        0,
        firstIntervalStart - secondIntervalEnd,
        secondIntervalStart - firstIntervalEnd
    );

    process.stdout.write(separation.toString() + '\n');
};

(() => {
    const dataStream = require('fs').readFileSync('/dev/stdin', 'utf-8');
    processCoordinates(dataStream);
})();