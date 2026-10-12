function analyzeLinkedListCycle(head) {
    if (head === null) {
        return {
            hasCycle: false,
            entryNode: null,
            cycleLength: 0
        };
    }

    const visitedNodes = new Set();
    let currentNode = head;

    do {
        if (visitedNodes.has(currentNode)) {
            const cycleEntry = currentNode;

            let cycleLength = 1;
            let cycleNode = cycleEntry.next;

            while (cycleNode !== cycleEntry) {
                cycleLength += 1;
                cycleNode = cycleNode.next;
            }

            return {
                hasCycle: true,
                entryNode: cycleEntry,
                cycleLength: cycleLength
            };
        }

        visitedNodes.add(currentNode);
        currentNode = currentNode.next;
    } while (currentNode !== null);

    return {
        hasCycle: false,
        entryNode: null,
        cycleLength: 0
    };
}