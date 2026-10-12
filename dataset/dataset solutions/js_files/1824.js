function analyzeLinkedListCycle(head) {
    const visitedPositions = new Map();

    let currentNode = head;
    let currentPosition = 0;

    while (currentNode !== null) {
        if (visitedPositions.has(currentNode)) {
            const firstPosition =
                visitedPositions.get(currentNode);

            return {
                hasCycle: true,
                entryNode: currentNode,
                cycleLength:
                    currentPosition - firstPosition
            };
        }

        visitedPositions.set(
            currentNode,
            currentPosition
        );

        currentNode = currentNode.next;
        currentPosition++;
    }

    return {
        hasCycle: false,
        entryNode: null,
        cycleLength: 0
    };
}