const parseCircleData = (rawText) => {
    const numericValues = rawText.match(/\d+/g).map(Number);
    const totalCircumference = numericValues[0];
    const pointCoordinates = numericValues.slice(2);
    return { totalCircumference, pointCoordinates };
};

const determinePathLength = (circumferenceValue, coordinatesList) => {
    const totalPoints = coordinatesList.length;

    const segmentLengths = coordinatesList.slice(0, totalPoints - 1).map((currentCoord, index) => {
        const nextCoord = coordinatesList[index + 1];
        return nextCoord - currentCoord;
    });

    const circularSegment = (circumferenceValue - coordinatesList[totalPoints - 1]) + coordinatesList[0];
    segmentLengths.push(circularSegment);

    const maximalGap = Math.max(...segmentLengths);

    return circumferenceValue - maximalGap;
};

const executeCircleProblem = (inputContent) => {
    const { totalCircumference, pointCoordinates } = parseCircleData(inputContent);
    const finalResult = determinePathLength(totalCircumference, pointCoordinates);
    console.log(finalResult);
};

executeCircleProblem(require("fs").readFileSync("/dev/stdin","utf8"));