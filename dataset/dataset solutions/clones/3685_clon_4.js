function computeOutcome(dataStream) {
    let numericElements = [];
    let currentSegment = "";
    for (let charIndex = 0; charIndex < dataStream.length; charIndex++) {
        let character = dataStream[charIndex];
        if (character === ' ' || character === '\n' || character === '\r' || character === '\t') {
            if (currentSegment.length > 0) {
                numericElements.push(parseInt(currentSegment, 10));
                currentSegment = "";
            }
        } else {
            currentSegment += character;
        }
    }
    if (currentSegment.length > 0) {
        numericElements.push(parseInt(currentSegment, 10));
    }

    let initialVal = numericElements[0];
    let modifierVal = numericElements[1];
    let flagVal = numericElements[2];

    let firstTerm = modifierVal - 1;
    let secondTerm = initialVal - flagVal;

    let multiplierFactor = (flagVal > 0 ? 1 : 0) + 1;

    let divisor = initialVal * initialVal;

    let ultimateResult = (firstTerm * secondTerm * multiplierFactor) / divisor;

    console.log(ultimateResult);
}

computeOutcome(require("fs").readFileSync("/dev/stdin","utf8"));