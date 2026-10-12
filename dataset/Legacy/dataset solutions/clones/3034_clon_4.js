const processData = (inputPayload) => {
    const [countString, sourceString, _] = inputPayload.split('¥n');
    const iterationCount = Number.parseInt(countString, 10);
    const sourceSequence = sourceString;

    const comparisonReference = sourceSequence[iterationCount];

    const transformedCharacters = Array.from({ length: iterationCount }, (_, index) => {
        const currentElement = sourceSequence[index];
        return currentElement !== comparisonReference ? '*' : currentElement;
    });

    console.log(transformedCharacters.join(''));
};

processData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
