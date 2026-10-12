const processNodeData = (rawInputContent) => {
    const cleanedInput = rawInputContent.trim();
    const allTokens = cleanedInput.split(/[ |\n]/);
    const nodeKeys = allTokens.slice(1);

    const outputFragments = [];

    for (let zeroBasedIndex = 0; zeroBasedIndex < nodeKeys.length; zeroBasedIndex++) {
        const oneBasedNodeIdentifier = zeroBasedIndex + 1;
        const currentNodeValue = nodeKeys[zeroBasedIndex];

        let currentLineParts = [`node ${oneBasedNodeIdentifier}: key = ${currentNodeValue}, `];

        // Determine parent key
        if (oneBasedNodeIdentifier > 1) {
            const parentOneBasedIndex = Math.floor(oneBasedNodeIdentifier / 2);
            const parentValue = nodeKeys[parentOneBasedIndex - 1];
            currentLineParts.push(`parent key = ${parentValue}, `);
        }

        // Determine left child key
        const leftChildOneBasedIndex = 2 * oneBasedNodeIdentifier;
        if (leftChildOneBasedIndex <= nodeKeys.length) {
            const leftChildValue = nodeKeys[leftChildOneBasedIndex - 1];
            currentLineParts.push(`left key = ${leftChildValue}, `);
        }

        // Determine right child key
        const rightChildOneBasedIndex = 2 * oneBasedNodeIdentifier + 1;
        if (rightChildOneBasedIndex <= nodeKeys.length) {
            const rightChildValue = nodeKeys[rightChildOneBasedIndex - 1];
            currentLineParts.push(`right key = ${rightChildValue}, `);
        }

        outputFragments.push(currentLineParts.join(''));
    }

    return outputFragments.join('\n');
};

console.log(processNodeData(require('fs').readFileSync('/dev/stdin','utf8')));
