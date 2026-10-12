(function executeProgram() {
    const generateNodeOutputString = (nodeIndex, dataArray) => {
        let outputSegments = [];
        outputSegments.push(`node ${nodeIndex}: key = ${dataArray[nodeIndex]}, `);

        if (nodeIndex > 0) {
            const parentIndex = Math.floor((nodeIndex - 1) / 2);
            outputSegments.push(`parent key = ${dataArray[parentIndex]}, `);
        }

        const leftChildIndexCandidate = 2 * nodeIndex + 1;
        if (leftChildIndexCandidate < dataArray.length) {
            outputSegments.push(`left key = ${dataArray[leftChildIndexCandidate]}, `);
        }

        const rightChildIndexCandidate = 2 * nodeIndex + 2;
        if (rightChildIndexCandidate < dataArray.length) {
            outputSegments.push(`right key = ${dataArray[rightChildIndexCandidate]}, `);
        }

        return outputSegments.join('');
    };

    const fileSystemModule = require('fs');
    const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const inputLines = rawFileContent.trim().split('\n');

    const nodeCountString = inputLines.shift();
    const nodeCount = Number(nodeCountString);

    const keysLine = inputLines.shift();
    const keyStringValues = keysLine.split(' ');
    const keyArray = keyStringValues.map(Number);

    keyArray.forEach((currentKey, currentIndex) => {
        const formattedNodeInfo = generateNodeOutputString(currentIndex, keyArray);
        console.log(formattedNodeInfo);
    });
})();
