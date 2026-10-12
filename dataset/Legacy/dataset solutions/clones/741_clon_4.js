var getRawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataSegments = getRawInput.trim().split("\n");

while (true) {
    var segmentCount = Number(dataSegments.shift());
    if (segmentCount === 0) {
        break;
    }

    var initialActivationLine = dataSegments.shift().split(":");
    var initialActiveItems = initialActivationLine[1].slice(0, -1).split(",");

    var reachableElements = new Set();
    var elementsToExplore = []; // Queue for Breadth-First Search (BFS)
    var exploredOutgoings = new Set(); // Tracks elements whose outgoing dependencies have been processed

    initialActiveItems.forEach(function(itemIdentifier) {
        reachableElements.add(itemIdentifier);
        elementsToExplore.push(itemIdentifier);
    });

    var adjacencyGraph = new Map(); // Stores dependency rules, replaces 'obj'
    for (var i = 0; i < segmentCount - 1; i++) {
        var graphRule = dataSegments.shift().split(":");
        var sourceIdentifier = graphRule[0];
        var targetIdentifiers = graphRule[1].slice(0, -1).split(",");
        adjacencyGraph.set(sourceIdentifier, targetIdentifiers);
    }

    // BFS-like propagation to find all reachable elements and mark processed outgoings
    while (elementsToExplore.length > 0) {
        var currentIdentifier = elementsToExplore.shift();

        // Only process and mark as explored if the current element has outgoing dependencies
        // This mirrors the original's F[k]=false logic which only applies if obj.hasOwnProperty(k)
        if (adjacencyGraph.has(currentIdentifier)) {
            if (exploredOutgoings.has(currentIdentifier)) {
                continue; // Skip if this node's outgoing edges were already processed
            }
            exploredOutgoings.add(currentIdentifier); // Mark this node's outgoing edges as processed

            for (const dependentIdentifier of adjacencyGraph.get(currentIdentifier)) {
                if (!reachableElements.has(dependentIdentifier)) {
                    reachableElements.add(dependentIdentifier);
                    elementsToExplore.push(dependentIdentifier); // Add to queue for future exploration
                }
            }
        }
    }

    var finalActiveCount = 0;
    // Count elements that are reachable but whose outgoing dependencies were NOT processed
    // This matches the original's final `if(F[k])cnt++` logic
    for (const itemIdentifier of reachableElements) {
        if (!exploredOutgoings.has(itemIdentifier)) {
            finalActiveCount++;
        }
    }
    console.log(finalActiveCount);
}
