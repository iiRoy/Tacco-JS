function discardRepeatedItems(collection) {
    const filteredCollection = [];

    for (
        let currentPosition = 0;
        currentPosition < collection.length;
        currentPosition++
    ) {
        if (!filteredCollection.includes(collection[currentPosition])) {
            filteredCollection.push(collection[currentPosition]);
        }
    }

    return filteredCollection;
}