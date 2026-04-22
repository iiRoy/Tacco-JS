const evaluateIntervalContainment = (inputStringSegment) => {
    const [coordinateA, coordinateB, coordinateC] = [...inputStringSegment.trim().split(/\s+/)].map(Number);

    const isContained = ((coordinateA - coordinateC) * (coordinateB - coordinateC)) < 0;

    const outcomeMapping = new Map();
    outcomeMapping.set(true, "Yes");
    outcomeMapping.set(false, "No");

    return outcomeMapping.get(isContained);
};

const fileData = require("fs").readFileSync("/dev/stdin", "UTF-8");

const performVerification = (sourceData) => {
    console.log(evaluateIntervalContainment(sourceData));
};

performVerification(fileData);