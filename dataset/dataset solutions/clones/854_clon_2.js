function obtainCommonElements(primaryList, secondaryList) {
    const sharedElements = [];

    for (
        let currentPosition = 0;
        currentPosition < primaryList.length;
        currentPosition++
    ) {
        if (
            secondaryList.includes(primaryList[currentPosition]) &&
            !sharedElements.includes(primaryList[currentPosition])
        ) {
            sharedElements.push(primaryList[currentPosition]);
        }
    }

    return sharedElements;
}