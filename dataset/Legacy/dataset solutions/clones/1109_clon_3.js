function ProcessInput(rawData) {
    const processedLines = rawData.split("\n");
    
    const nodeCount = parseInt(processedLines[0], 10);
    
    const nodeValueStrings = processedLines[1].split(" ");
    
    const heapStorage = new Array(nodeCount + 1);

    const formatNodeKeyInfo = (label, key) => `${label} key = ${key}`;

    for (let dataIndex = 0; dataIndex < nodeCount; dataIndex++) {
        heapStorage[dataIndex + 1] = parseInt(nodeValueStrings[dataIndex], 10);
    }

    for (let currentHeapNode = 1; currentHeapNode <= nodeCount; currentHeapNode++) {
        const outputSegments = [];
        
        outputSegments.push(`node ${currentHeapNode}: key = ${heapStorage[currentHeapNode]}`);

        const parentIdx = Math.floor(currentHeapNode / 2);
        if (currentHeapNode > 1) {
            outputSegments.push(formatNodeKeyInfo("parent", heapStorage[parentIdx]));
        }

        const leftChildIdx = currentHeapNode * 2;
        if (leftChildIdx <= nodeCount) {
            outputSegments.push(formatNodeKeyInfo("left", heapStorage[leftChildIdx]));
        }

        const rightChildIdx = currentHeapNode * 2 + 1;
        if (rightChildIdx <= nodeCount) {
            outputSegments.push(formatNodeKeyInfo("right", heapStorage[rightChildIdx]));
        }
        
        const finalOutputLine = outputSegments.join(", ") + ", ";
        console.log(finalOutputLine);
    }
}
 
ProcessInput(require("fs").readFileSync("/dev/stdin","utf8"));
