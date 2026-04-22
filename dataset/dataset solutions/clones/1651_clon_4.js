const processNumericChallenge = (sourceText) => {
    const textSections = sourceText.trim().split('\n');

    const firstRowValues = textSections[0].split(' ').map(Number);
    const totalElements = firstRowValues[0];
    const segmentLength = firstRowValues[1];

    const valueSeries = textSections[1].split(' ').map(Number);

    const segmentProducts = Array.from({ length: totalElements - segmentLength + 1 }, (_, position) => {
        const currentSegment = valueSeries.slice(position, position + segmentLength);
        return currentSegment.reduce((accum, currentVal) => accum * currentVal, 1);
    });

    const outcomeSequence = [];
    if (segmentProducts.length > 1) {
        segmentProducts.slice(1).forEach((currentProductValue, indexInSliced) => {
            const previousProductValue = segmentProducts[indexInSliced];
            outcomeSequence.push(previousProductValue < currentProductValue ? 'Yes' : 'No');
        });
    }

    outcomeSequence.forEach(resultLine => console.log(resultLine));
};

processNumericChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));