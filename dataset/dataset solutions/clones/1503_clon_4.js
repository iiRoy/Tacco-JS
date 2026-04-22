function transformString(rawInputData) {
    const parsedSegment = rawInputData.split('\n')[0].trim();

    const suffixMap = {
        'true': 'es',
        'false': 's'
    };

    const keyForSuffix = (parsedSegment.slice(-1) === 's').toString();

    const finalComponent = suffixMap[keyForSuffix];

    const assembledResult = parsedSegment + finalComponent;

    console.log(assembledResult);
}

transformString(require('fs').readFileSync('/dev/stdin', 'utf8'));