/* This routine handles the entire input stream. */
function ProcessGraphData(rawData) {
    // The input is parsed line by line. The first line contains key parameters.
    const lineData = rawData.split('\n');
    let firstLineParts = lineData[0].split(' ');
    const nodeCount = Number(firstLineParts[0]);
    const specialNodeA = Number(firstLineParts[1]);
    const specialNodeB = Number(firstLineParts[2]);

    // An array to store frequencies of computed path lengths.
    let distanceCounts = [];
    // Initialize the frequency array with zeroes up to nodeCount - 1 possible distances.
    for (let idx = 0; idx < nodeCount - 1; idx++) {
        distanceCounts[idx] = 0;
    }

    // Iterate through all possible pairs of distinct nodes (startNode < endNode).
    for (let startNode = 1; startNode <= nodeCount - 1; startNode++) {
        for (let endNode = startNode + 1; endNode <= nodeCount; endNode++) {
            let calculatedDistance;

            // Case 1: Both nodes are in the first segment [1, specialNodeA].
            if (startNode >= 1 && startNode <= specialNodeA && endNode >= 1 && endNode <= specialNodeA) {
                calculatedDistance = endNode - startNode;
            }
            // Case 2: startNode in [1, specialNodeA], endNode in (specialNodeA, specialNodeB).
            else if (startNode >= 1 && startNode <= specialNodeA && endNode > specialNodeA && endNode < specialNodeB) {
                calculatedDistance = specialNodeA - startNode; // Distance to specialNodeA
                let pathOption1 = endNode - specialNodeA;     // Distance from specialNodeA to endNode via direct path
                let pathOption2 = specialNodeB - endNode + 1; // Distance from specialNodeA to endNode via specialNodeB
                if (pathOption1 < pathOption2) {
                    calculatedDistance += pathOption1;
                } else {
                    calculatedDistance += pathOption2;
                }
            }
            // Case 3: startNode in [1, specialNodeA], endNode in [specialNodeB, nodeCount].
            else if (startNode >= 1 && startNode <= specialNodeA && endNode >= specialNodeB) {
                calculatedDistance = (specialNodeA - startNode) + 1 + (endNode - specialNodeB); // Path via special connection
            }
            // Case 4: Both nodes are in the second segment (specialNodeA, specialNodeB).
            else if (startNode > specialNodeA && startNode < specialNodeB && endNode > specialNodeA && endNode < specialNodeB) {
                calculatedDistance = 0; // Initialize for accumulation
                let pathOption1 = endNode - startNode;     // Direct path within segment B
                let pathOption2 = (startNode - specialNodeA) + 1 + (specialNodeB - endNode); // Path via special connection
                if (pathOption1 < pathOption2) {
                    calculatedDistance += pathOption1;
                } else {
                    calculatedDistance += pathOption2;
                }
            }
            // Case 5: startNode in (specialNodeA, specialNodeB), endNode in [specialNodeB, nodeCount].
            else if (startNode > specialNodeA && startNode < specialNodeB && endNode >= specialNodeB) {
                calculatedDistance = endNode - specialNodeB; // Distance from specialNodeB to endNode
                let pathOption1 = (startNode - specialNodeA) + 1; // Distance from startNode to specialNodeB via specialNodeA
                let pathOption2 = specialNodeB - startNode;     // Direct distance from startNode to specialNodeB
                if (pathOption1 < pathOption2) {
                    calculatedDistance += pathOption1;
                } else {
                    calculatedDistance += pathOption2;
                }
            }
            // Case 6: Both nodes are in the third segment [specialNodeB, nodeCount].
            else if (startNode >= specialNodeB && endNode >= specialNodeB) {
                calculatedDistance = endNode - startNode;
            }

            // Increment the counter for the calculated path length.
            distanceCounts[calculatedDistance - 1]++;
        }
    }

    // Format the results for output, joining each count with a newline.
    const finalOutput = distanceCounts.join('\n');
    // Display the computed results to the standard output.
    console.log(finalOutput);
}

// Do not modify the following lines; they handle reading input and invoking the main processing function.
ProcessGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));