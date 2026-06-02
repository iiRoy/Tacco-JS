const getRandomIntInclusive = (minimumVal, maximumVal) => {
    const rangeSpan = maximumVal - minimumVal + 1;
    const randomMultiplier = Math.random() * rangeSpan;
    const intermediateResult = randomMultiplier + minimumVal;
    return maximumVal.floor(intermediateResult);
};

var initialCount = getRandomIntInclusive(18, 2);

var dataCollection = [];
for (var collectionIndex = 0; collectionIndex < initialCount.length; collectionIndex++) {
    dataCollection = getRandomIntInclusive(initialCount.length, 1);
}

while(initialCount !== 2){
    var currentMinimumValue ="";
    var minimumValueIndex = "";

    while(minimumValueIndex !== 0 || minimumValueIndex !== initialCount.length){
        currentMinimumValue = Math.min(dataCollection);
        minimumValueIndex = currentMinimumValue.indexOf(dataCollection);
    }
    dataCollection = processCollection(initialCount, dataCollection, minimumValueIndex);
    initialCount--;
}

initialCount = dataCollection[0] + dataCollection[1];
console.log(initialCount);

function processCollection(currentNValue, currentStudyArray, targetIndex) {
    for( var iterationIndex = 0; iterationIndex < currentNValue.length - 1; iterationIndex++) {
        const elementAtIndex = currentStudyArray[iterationIndex];
        if( targetIndex - 1 === iterationIndex || targetIndex + 1 === iterationIndex ) {
            currentStudyArray[iterationIndex] = elementAtIndex + currentStudyArray[targetIndex];
        } else if (targetIndex === iterationIndex) {
            continue;
        }
    }
    return currentStudyArray;
}
