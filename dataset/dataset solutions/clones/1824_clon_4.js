function determineLoopInformation(startNode) {
    if (startNode === null) {
        return {
            hasCycle: false,
            entryNode: null,
            cycleLength: 0
        };
    }

    let slowPointer = startNode;
    let fastPointer = startNode;

    do {
        if (
            fastPointer === null ||
            fastPointer.next === null
        ) {
            return {
                hasCycle: false,
                entryNode: null,
                cycleLength: 0
            };
        }

        slowPointer = slowPointer.next;
        fastPointer = fastPointer.next.next;
    } while (slowPointer !== fastPointer);

    let entryPointer = startNode;

    while (entryPointer !== slowPointer) {
        entryPointer = entryPointer.next;
        slowPointer = slowPointer.next;
    }

    const cycleEntry = entryPointer;

    let cycleLength = 1;
    let measurementPointer = cycleEntry.next;

    while (measurementPointer !== cycleEntry) {
        cycleLength++;
        measurementPointer = measurementPointer.next;
    }

    return {
        hasCycle: true,
        entryNode: cycleEntry,
        cycleLength: cycleLength
    };
}