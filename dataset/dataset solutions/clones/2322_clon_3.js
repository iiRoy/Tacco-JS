function processData(dataCollection) {
    const sourceStringOne = dataCollection[1];
    const sourceStringTwo = dataCollection[2];
    const processingLength = sourceStringOne.length;

    let combinedSegments = [];

    for (let currentIndex = 0; currentIndex < processingLength; currentIndex++) {
        const characterA = sourceStringOne[currentIndex];
        const characterB = sourceStringTwo[currentIndex];
        const currentSegment = characterA + characterB;
        combinedSegments.push(currentSegment);
    }

    const finalOutputString = combinedSegments.join('');
    console.log('%s', finalOutputString);
}
