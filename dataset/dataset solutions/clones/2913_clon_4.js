function ProcessGame(gameDataInput) {
    const linesOfData = gameDataInput.trim().split("\n");
    const [paramLine, itemLine] = linesOfData;

    const initialParameters = paramLine.split(" ").map(Number);
    const itemQuantity = initialParameters[0];
    const actionLimit = initialParameters[1];

    const initialItemSet = itemLine.split(" ").map(Number);

    const totalPositiveSum = initialItemSet.reduce((accumulator, value) => accumulator + (value > 0 ? value : 0), 0);

    let maximumScoreAttained = 0;
    let optimumFound = false;

    const explorationQueue = [];

    // Initial state: [itemsInQueue, itemsInCollection]
    explorationQueue.push({
        currentArrangement: [initialItemSet.slice(), []],
        actionsPerformed: 0
    });

    const calculateCollectionValue = (itemsInCollection) => {
        return itemsInCollection.reduce((sum, value) => sum + value, 0);
    };

    // Operation 1: Move first item from queue to collection
    const transferFirstToCollection = (arrangement) => {
        const [queueItems, collectionItems] = arrangement;
        if (queueItems.length === 0) return null;
        const newQueue = queueItems.slice();
        const newCollection = collectionItems.slice();
        newCollection.push(newQueue.shift());
        return [newQueue, newCollection];
    };

    // Operation 2: Move last item from queue to collection
    const transferLastToCollection = (arrangement) => {
        const [queueItems, collectionItems] = arrangement;
        if (queueItems.length === 0) return null;
        const newQueue = queueItems.slice();
        const newCollection = collectionItems.slice();
        newCollection.push(newQueue.pop());
        return [newQueue, newCollection];
    };

    // Operation 3: Move item from collection (by index) to front of queue
    const returnToQueueFront = (arrangement, elementIndex) => {
        const [queueItems, collectionItems] = arrangement;
        if (elementIndex < 0 || elementIndex >= collectionItems.length) return null;
        const newQueue = queueItems.slice();
        const newCollection = collectionItems.slice();
        newQueue.unshift(newCollection.splice(elementIndex, 1)[0]);
        return [newQueue, newCollection];
    };

    // Operation 4: Move item from collection (by index) to back of queue
    const returnToQueueBack = (arrangement, elementIndex) => {
        const [queueItems, collectionItems] = arrangement;
        if (elementIndex < 0 || elementIndex >= collectionItems.length) return null;
        const newQueue = queueItems.slice();
        const newCollection = collectionItems.slice();
        newQueue.push(newCollection.splice(elementIndex, 1)[0]);
        return [newQueue, newCollection];
    };

    // Breadth-First Search for optimal path
    while (explorationQueue.length > 0 && !optimumFound) {
        const { currentArrangement, actionsPerformed } = explorationQueue.shift();
        const [currentQueue, currentCollection] = currentArrangement;

        const currentCollectionValue = calculateCollectionValue(currentCollection);
        if (currentCollectionValue > maximumScoreAttained) {
            maximumScoreAttained = currentCollectionValue;
            if (maximumScoreAttained === totalPositiveSum) {
                optimumFound = true;
            }
        }

        if (actionsPerformed >= actionLimit || optimumFound) {
            continue;
        }

        const nextActionsPerformed = actionsPerformed + 1;

        // Explore possible next states
        if (currentQueue.length > 0) {
            const nextArrangement1 = transferFirstToCollection(currentArrangement);
            if (nextArrangement1) {
                explorationQueue.push({ currentArrangement: nextArrangement1, actionsPerformed: nextActionsPerformed });
            }

            const nextArrangement2 = transferLastToCollection(currentArrangement);
            if (nextArrangement2) {
                explorationQueue.push({ currentArrangement: nextArrangement2, actionsPerformed: nextActionsPerformed });
            }
        }

        for (let itemIdx = 0; itemIdx < currentCollection.length; itemIdx++) {
            const nextArrangement3 = returnToQueueFront(currentArrangement, itemIdx);
            if (nextArrangement3) {
                explorationQueue.push({ currentArrangement: nextArrangement3, actionsPerformed: nextActionsPerformed });
            }

            const nextArrangement4 = returnToQueueBack(currentArrangement, itemIdx);
            if (nextArrangement4) {
                explorationQueue.push({ currentArrangement: nextArrangement4, actionsPerformed: nextActionsPerformed });
            }
        }
    }

    console.log(maximumScoreAttained);
}

ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));