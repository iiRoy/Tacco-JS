function processInputData(rawData) {
    const initialSegment = rawData.split("\n")[0];
    const segmentLength = initialSegment.length;

    switch (segmentLength) {
        case 2:
            console.log(initialSegment);
            break;
        case 3:
            const reversedSegment = initialSegment.split('').reduce((accumulator, character) => character + accumulator, '');
            console.log(reversedSegment);
            break;
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
