function locateElementPosition(orderedCollection, searchedElement) {
    for (
        let currentPosition = 0;
        currentPosition < orderedCollection.length;
        currentPosition++
    ) {
        if (orderedCollection[currentPosition] === searchedElement) {
            return currentPosition;
        }

        if (orderedCollection[currentPosition] > searchedElement) {
            break;
        }
    }

    return -1;
}