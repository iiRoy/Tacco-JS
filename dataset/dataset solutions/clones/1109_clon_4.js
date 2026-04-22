function processBinaryHeap(rawContent) {
    const linesOfInput = rawContent.split('\n');
    const totalNodes = Number.parseInt(linesOfInput[0].trim(), 10);
    const nodeValues = linesOfInput[1].trim().split(' ').map(Number.parseInt);

    function constructNodeOutput(nodeIndex, valuesArr, count) {
        let outputString = `node ${nodeIndex}: key = ${valuesArr[nodeIndex - 1]}, `;

        const parentIndex = (nodeIndex / 2) | 0; // Bitwise OR 0 for floor division
        if (parentIndex >= 1) {
            outputString += `parent key = ${valuesArr[parentIndex - 1]}, `;
        }

        const leftChildIndex = nodeIndex * 2;
        if (leftChildIndex <= count) {
            outputString += `left key = ${valuesArr[leftChildIndex - 1]}, `;
        }

        const rightChildIndex = nodeIndex * 2 + 1;
        if (rightChildIndex <= count) {
            outputString += `right key = ${valuesArr[rightChildIndex - 1]}, `;
        }

        return outputString;
    }

    for (let currentPosition = 1; currentPosition <= totalNodes; ++currentPosition) {
        console.info(constructNodeOutput(currentPosition, nodeValues, totalNodes));
    }
}

processBinaryHeap(require("fs").readFileSync("/dev/stdin","utf8"));