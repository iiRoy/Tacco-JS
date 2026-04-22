const resolver = (sourceData) => {
    const cleanedData = sourceData.replace(/^\s+|\s+$/g, '');

    const segmentList = [];
    let currentSegment = '';
    for (let currentPosition = 0; currentPosition < cleanedData.length; currentPosition++) {
        if (cleanedData[currentPosition] === ' ') {
            segmentList.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += cleanedData[currentPosition];
        }
    }
    segmentList.push(currentSegment);

    const numericCollection = [];
    for (let index = 0; index < segmentList.length; index++) {
        numericCollection.push(Number(segmentList[index]));
    }

    const firstValue = numericCollection[0];
    const secondValue = numericCollection[1];
    const thirdValue = numericCollection[2];

    const squaredDifferenceOne = (firstValue - secondValue) * (firstValue - secondValue);
    const squaredDifferenceTwo = (firstValue - thirdValue) * (firstValue - thirdValue);

    const finalDecision = squaredDifferenceOne < squaredDifferenceTwo ? "A" : "B";
    console.log(finalDecision);
};

resolver(require("fs").readFileSync("/dev/stdin", "utf8"));