function processor(lengthParam, sequenceString) {
    const charCollection = sequenceString.split('');

    const colorTallies = charCollection.reduce((accum, charSymbol) => {
        accum[charSymbol] = (accum[charSymbol] || 0) + 1;
        return accum;
    }, {});

    const redTally = colorTallies['R'] || 0;
    const greenTally = colorTallies['G'] || 0;
    const blueTally = colorTallies['B'] || 0;

    const overallProduct = redTally * greenTally * blueTally;

    let deductionSum = 0;
    const seqLength = parseInt(lengthParam, 10);

    for (let firstAnchor = 0; firstAnchor < seqLength; ++firstAnchor) {
        for (let commonDiff = 1; ; ++commonDiff) {
            const middleAnchor = firstAnchor + commonDiff;
            const finalAnchor = firstAnchor + 2 * commonDiff;

            if (finalAnchor >= seqLength) {
                break;
            }

            const charAtFirst = charCollection[firstAnchor];
            const charAtMiddle = charCollection[middleAnchor];
            const charAtFinal = charCollection[finalAnchor];

            if (charAtFirst !== charAtMiddle && charAtMiddle !== charAtFinal && charAtFirst !== charAtFinal) {
                ++deductionSum;
            }
        }
    }

    console.log(overallProduct - deductionSum);
}

const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
processor(inputSource[0], inputSource[1]);