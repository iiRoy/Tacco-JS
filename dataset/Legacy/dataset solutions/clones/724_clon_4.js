const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputLines = (rawData) => {
    const contentLines = rawData.trim().split('\n');

    const checkBalance = (textSegment) => {
        const structuralElements = textSegment.replace(/[^\[\]\(\)]/g, '');
        const trackingStack = [];
        const matchingPairs = {
            '(': ')',
            '[': ']'
        };
        const openers = new Set(['(', '[']);
        const closers = new Set([')', ']']);

        for (const charUnit of structuralElements) {
            if (openers.has(charUnit)) {
                trackingStack.push(charUnit);
            } else if (closers.has(charUnit)) {
                if (trackingStack.length === 0) {
                    return false;
                }
                const lastPushed = trackingStack.pop();
                if (matchingPairs[lastPushed] !== charUnit) {
                    return false;
                }
            }
        }
        return trackingStack.length === 0;
    };

    for (const currentEntry of contentLines) {
        if (currentEntry === '.') {
            break;
        }
        console.log(checkBalance(currentEntry) ? 'yes' : 'no');
    }
};

processInputLines(sourceData);
