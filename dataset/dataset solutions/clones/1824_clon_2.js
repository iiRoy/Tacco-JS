function inspectChainLoop(firstElement) {
    const recordedLocations = new Map();

    let inspectedElement = firstElement;
    let inspectedLocation = 0;

    while (inspectedElement !== null) {
        if (recordedLocations.has(inspectedElement)) {
            const originalLocation =
                recordedLocations.get(inspectedElement);

            return {
                hasCycle: true,
                entryNode: inspectedElement,
                cycleLength:
                    inspectedLocation - originalLocation
            };
        }

        recordedLocations.set(
            inspectedElement,
            inspectedLocation
        );

        inspectedElement = inspectedElement.next;
        inspectedLocation++;
    }

    return {
        hasCycle: false,
        entryNode: null,
        cycleLength: 0
    };
}