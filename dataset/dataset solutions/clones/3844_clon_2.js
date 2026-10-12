function obtainLargestSharedBeginning(textCollection) {
    if (textCollection.length === 0) {
        return "";
    }

    let sharedBeginning = textCollection[0];

    for (
        let currentPosition = 1;
        currentPosition < textCollection.length;
        currentPosition++
    ) {
        const inspectedText =
            textCollection[currentPosition];

        while (!inspectedText.startsWith(sharedBeginning)) {
            sharedBeginning =
                sharedBeginning.slice(0, -1);

            if (sharedBeginning === "") {
                return "";
            }
        }
    }

    return sharedBeginning;
}