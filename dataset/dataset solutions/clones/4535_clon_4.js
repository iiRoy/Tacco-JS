const processSymbolSequence = (textSource) => {
    const contentSegments = textSource.split('\n');
    const primarySequence = contentSegments[1];

    const symbolUnits = primarySequence.split('');

    const balanceState = symbolUnits.reduce((tracker, currentSymbol) => {
        if (currentSymbol === '(') {
            tracker.activeOpenCount++;
        } else if (currentSymbol === ')') {
            if (tracker.activeOpenCount > 0) {
                tracker.activeOpenCount--;
            } else {
                tracker.unmatchedCloseCount++;
            }
        }
        return tracker;
    }, { activeOpenCount: 0, unmatchedCloseCount: 0 });

    const requiredLefts = balanceState.unmatchedCloseCount;
    const requiredRights = balanceState.activeOpenCount;

    const prefixSegment = '('.repeat(requiredLefts);
    const suffixSegment = ')'.repeat(requiredRights);

    return `${prefixSegment}${primarySequence}${suffixSegment}`;
};

const rawInputPayload = require('fs').readFileSync('/dev/stdin', 'utf8');

const computedOutput = processSymbolSequence(rawInputPayload);

console.log(computedOutput);