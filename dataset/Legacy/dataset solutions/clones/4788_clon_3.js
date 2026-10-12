let inputHandler = initializeInputProcessor();
processGraphData();

function getNextInteger() {
    return convertInputData(fetchNextLine(), 1);
}

function getNextStringArray() {
    return convertInputData(fetchNextLine(), 2);
}

function getNextIntegerArray() {
    return convertInputData(fetchNextLine(), 4);
}

function getNextCharacterArray() {
    return convertInputData(fetchNextLine(), 6);
}

function fetchNextLine() {
    return inputHandler.fetchNextLine();
}

function hasMoreInput() {
    return inputHandler.hasMoreInput();
}

function readInputFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
    const rawInputLines = readInputFile();
    const totalLines = rawInputLines.length;

    const inputProcessor = {
        lines: rawInputLines,
        linePointer: 0,
        totalLines: totalLines,
        hasMoreInput: function() {
            return this.linePointer < this.totalLines;
        },
        fetchNextLine: function() {
            if (!this.hasMoreInput()) {
                throw new Error("Input exhausted: No more lines to read.");
            }
            const lineContent = this.lines[this.linePointer];
            this.linePointer++;
            return lineContent;
        }
    };
    return inputProcessor;
}

function printOutput(data) {
    console.log(data);
}

function printError(data) {
    console.error(data);
}

function convertInputData(inputVal, conversionType) {
    const converters = {
        1: (val) => Number.parseInt(val, 10),
        2: (val) => val.split(' '),
        4: (val) => val.split(' ').map(v => Number(v)),
        6: (val) => val.split(''),
        7: (val) => val.split('').map(v => Number(v)),
        8: (val) => val.join(' '),
        9: (val) => val.join('\n'),
        0: (val) => val.join('')
    };

    try {
        const converter = converters[conversionType];
        return converter ? converter(inputVal) : inputVal;
    } catch (e) {
        return inputVal;
    }
}

function processGraphData() {
    const firstLineData = getNextIntegerArray();
    const numNodes = firstLineData[0];
    const numEdges = firstLineData[1];

    const INF_VAL = 1000000007; // Represents infinity for path calculations

    // Initialize adjacency matrices for shortest paths and original edge weights
    const shortestPaths = Array.from({ length: numNodes }, (_, i) => {
        const row = Array(numNodes).fill(INF_VAL);
        row[i] = 0; // Distance to self is 0
        return row;
    });

    const originalEdges = Array.from({ length: numNodes }, (_, i) => {
        const row = Array(numNodes).fill(INF_VAL);
        row[i] = 0; // Distance to self is 0
        return row;
    });

    // Populate adjacency matrices with initial edge weights
    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const edgeDetails = getNextIntegerArray();
        const startNode = edgeDetails[0] - 1;
        const endNode = edgeDetails[1] - 1;
        const edgeWeight = edgeDetails[2];

        // For an undirected graph, update both (u,v) and (v,u)
        shortestPaths[startNode][endNode] = edgeWeight;
        shortestPaths[endNode][startNode] = edgeWeight;
        originalEdges[startNode][endNode] = edgeWeight;
        originalEdges[endNode][startNode] = edgeWeight;
    }

    // Apply Floyd-Warshall algorithm to find all-pairs shortest paths
    for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
        for (let sourceNode = 0; sourceNode < numNodes; sourceNode++) {
            for (let destNode = 0; destNode < numNodes; destNode++) {
                const pathViaIntermediate = shortestPaths[sourceNode][intermediateNode] + shortestPaths[intermediateNode][destNode];
                if (shortestPaths[sourceNode][destNode] > pathViaIntermediate) {
                    shortestPaths[sourceNode][destNode] = pathViaIntermediate;
                }
            }
        }
    }

    // Count redundant edges
    let redundantEdgeCount = 0;
    for (let r = 0; r < numNodes; r++) {
        for (let c = 0; c < numNodes; c++) {
            const initialWeight = originalEdges[r][c];
            const calculatedShortest = shortestPaths[r][c];

            // An edge (r,c) is redundant if it existed initially (initialWeight !== INF_VAL)
            // AND its weight is not equal to the shortest path found between r and c.
            // This means a shorter path exists, implying this direct edge is not essential for shortest paths.
            if (initialWeight !== INF_VAL && initialWeight !== calculatedShortest) {
                redundantEdgeCount++;
            }
        }
    }

    // Each redundant edge (u,v) is counted twice (as (u,v) and (v,u)), so divide by 2.
    printOutput(redundantEdgeCount / 2);
}
