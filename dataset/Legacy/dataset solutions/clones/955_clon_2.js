var priorityQueue = [], queueSize = 0;
priorityQueue[0] = new Array(2);
priorityQueue[0][0] = -1;
priorityQueue[0][1] = -1;
 
// Function to add an element to the min-heap
function addNodeToQueue(elementToAdd){
    priorityQueue[++queueSize] = elementToAdd;
 
    var currentIndex = queueSize;
 
    // Bubble up the new element to maintain heap property
    while(priorityQueue[currentIndex][1] < priorityQueue[Math.floor(currentIndex / 2)][1]){
        var tempSwap = priorityQueue[currentIndex];
        priorityQueue[currentIndex] = priorityQueue[Math.floor(currentIndex / 2)];
        priorityQueue[Math.floor(currentIndex / 2)] = tempSwap;
        currentIndex = Math.floor(currentIndex / 2);
    }
}
 
// Function to extract the minimum element from the min-heap
function retrieveMinElement(){
    if(queueSize <= 0)
        return; // Heap is empty
 
    var minElement = priorityQueue[1]; // The root is the minimum
 
    // Move the last element to the root and decrease heap size
    priorityQueue[1] = priorityQueue[queueSize--];
 
    var heapIndex = 1;
    // Bubble down the new root to maintain heap property
    while((heapIndex * 2 <= queueSize && priorityQueue[heapIndex][1] > priorityQueue[heapIndex * 2][1]) || (heapIndex * 2 + 1 <= queueSize && priorityQueue[heapIndex][1] > priorityQueue[heapIndex * 2 + 1][1])){
        var leftChildIndex = heapIndex * 2;
        var rightChildIndex = heapIndex * 2; // Initialize right to left, then adjust if exists
        if(heapIndex * 2 + 1 <= queueSize)
            rightChildIndex++;
        
        // Determine which child is smaller
        var minChildIndex = priorityQueue[leftChildIndex][1] <= priorityQueue[rightChildIndex][1] ? leftChildIndex : rightChildIndex;
        
        var swapHolder = priorityQueue[heapIndex];
        priorityQueue[heapIndex] = priorityQueue[minChildIndex];
        priorityQueue[minChildIndex] = swapHolder;
        heapIndex = minChildIndex;
    }
    return minElement;
}

// Main function to process graph data and find MST using Prim's algorithm
function processGraphData(rawData){
    rawData = rawData.split("\n");
    var numVertices = parseInt(rawData[0], 10);

    var adjacencyMatrix = [];

    // Parse the adjacency matrix from input
    for(var rowIdx = 0; rowIdx < numVertices; rowIdx++){
        adjacencyMatrix[rowIdx] = new Array(numVertices);
        rawData[rowIdx + 1] = rawData[rowIdx + 1].split(" ");
        for(var colIdx = 0; colIdx < numVertices; colIdx++){
            adjacencyMatrix[rowIdx][colIdx] = parseInt(rawData[rowIdx + 1][colIdx + 1], 10);
        }
    }

    var minimumSpanningTree = [];

    // Initialize MST matrix with -1 (no edge)
    for(var r = 0; r < numVertices; r++){
        minimumSpanningTree[r] = new Array(numVertices);
        for(var c = 0; c < numVertices; c++){
            minimumSpanningTree[r][c] = -1;
        }
    }

    var visitedCount = 1; // Count of vertices included in MST
    var isVisited = Array(numVertices); // Boolean array to track visited vertices
    
    // Initialize all vertices as not visited
    for(var vtx = 0; vtx < numVertices; vtx++)
        isVisited[vtx] = false;
    isVisited[0] = true; // Start Prim's algorithm from vertex 0
    
    // Add all edges from the starting vertex (vertex 0) to the priority queue
    for(var neighborIdx = 0; neighborIdx < numVertices; neighborIdx++){
        if(adjacencyMatrix[0][neighborIdx] > -1){
            // Edge format: [destination_vertex, weight, source_vertex]
            var edgeDetails = [];
            edgeDetails[0] = neighborIdx;
            edgeDetails[1] = adjacencyMatrix[0][neighborIdx];
            edgeDetails[2] = 0; // Source vertex is 0
            addNodeToQueue(edgeDetails);
        }
    }

    // Main loop for Prim's algorithm
    while(visitedCount < numVertices){
        var extractedEdge = retrieveMinElement(); // Get the smallest edge
        
        // If the destination vertex of this edge is already visited, skip it
        if(isVisited[extractedEdge[0]])
            continue;

        // Mark the destination vertex as visited
        isVisited[extractedEdge[0]] = true;
        // Add the edge to the MST
        minimumSpanningTree[extractedEdge[0]][extractedEdge[2]] = minimumSpanningTree[extractedEdge[2]][extractedEdge[0]] = extractedEdge[1];
        visitedCount++; // Increment count of visited vertices

        // Add all edges from the newly visited vertex to the priority queue
        for(var currentNeighbor = 0; currentNeighbor < numVertices; currentNeighbor++){
            if(adjacencyMatrix[extractedEdge[0]][currentNeighbor] > -1){
                var newEdge =[];
                newEdge[0] = currentNeighbor;
                newEdge[1] = adjacencyMatrix[extractedEdge[0]][currentNeighbor];
                newEdge[2] = extractedEdge[0]; // Source vertex is the newly visited one
                addNodeToQueue(newEdge);
            }
        }
    }

    var totalWeight = 0;

    // Calculate the total weight of the MST
    for(var r_idx = 0; r_idx < numVertices; r_idx++){
        for(var c_idx = 0; c_idx < numVertices; c_idx++){
            // Only sum each edge once (e.g., for i < j) and if it's a valid edge
            if(r_idx < c_idx && minimumSpanningTree[r_idx][c_idx] > -1)
                totalWeight += minimumSpanningTree[r_idx][c_idx];
        }
    }
    console.log(totalWeight);
}

// Read input from stdin and execute the main processing function
processGraphData(require("fs").readFileSync("/dev/stdin","utf8"));
