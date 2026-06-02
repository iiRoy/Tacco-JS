'use strict';

const processData = rawData => {
    const firstSegment = rawData.split('\n')[0].split(' ')[0];
    const parsedValue = Number.parseInt(firstSegment, 10);

    const finalResult = parsedValue << (parsedValue & 1);

    console.log(finalResult);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
