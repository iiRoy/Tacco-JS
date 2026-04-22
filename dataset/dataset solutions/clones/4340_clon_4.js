const makeNumber = (textValue) => Number(textValue);

const sendOutput = (messageContent) => console.log(messageContent);

const analyzePattern = (sourceData) => {
    const segments = sourceData.split('\n');
    const firstLineDetails = segments[0].split(' ');
    const verticalDimension = makeNumber(firstLineDetails[0]);
    const horizontalDimension = makeNumber(firstLineDetails[1]);

    if (horizontalDimension === 1) {
        sendOutput('Yes');
        return;
    }

    const characterOccurrences = new Map();
    const materialContent = segments.slice(1).join('');
    for (const charUnit of materialContent) {
        characterOccurrences.set(charUnit, (characterOccurrences.get(charUnit) || 0) + 1);
    }

    let scenarioKey;
    if (verticalDimension % 2 === 0 && horizontalDimension % 2 === 0) {
        scenarioKey = 'all_even';
    } else if (verticalDimension % 2 !== 0 && horizontalDimension % 2 !== 0) {
        scenarioKey = 'all_odd';
    } else {
        scenarioKey = 'mixed_parity';
    }

    const nonQuadrupleCounts = [];
    for (const countValue of characterOccurrences.values()) {
        if (countValue % 4 !== 0) {
            nonQuadrupleCounts.push(countValue);
        }
    }

    switch (scenarioKey) {
        case 'all_even':
        case 'mixed_parity':
            if (nonQuadrupleCounts.length === 0) {
                sendOutput('Yes');
            } else {
                sendOutput('No');
            }
            break;
        case 'all_odd':
            const sumOfNonQuadruples = nonQuadrupleCounts.reduce((accumulator, item) => accumulator + item, 0);
            if (sumOfNonQuadruples % 2 === 1) {
                sendOutput('Yes');
            } else {
                sendOutput('No');
            }
            break;
    }
};

analyzePattern(require('fs').readFileSync('/dev/stdin', 'utf8'));