const computeLongestAscendingChain = () => {
    const sequenceItems = sourceData.slice(1);

    if (sequenceItems.length === 0) {
        process.stdout.write("0\n");
        return;
    }

    const chainEnds = [];

    for (const currentElement of sequenceItems) {
        let searchLow = 0;
        let searchHigh = chainEnds.length;

        while (searchLow < searchHigh) {
            const searchMid = Math.floor((searchLow + searchHigh) / 2);
            if (chainEnds[searchMid] < currentElement) {
                searchLow = searchMid + 1;
            } else {
                searchHigh = searchMid;
            }
        }

        if (searchLow === chainEnds.length) {
            chainEnds.push(currentElement);
        } else {
            chainEnds[searchLow] = currentElement;
        }
    }

    process.stdout.write(chainEnds.length.toString() + "\n");
};

const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
const sourceData = rawInputBuffer.trim().split("\n").map(Number);

computeLongestAscendingChain();