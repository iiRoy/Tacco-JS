function obtainContentFromSource() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function executeTransformation(dataBundle) {
    const textSegments = dataBundle.split('\n');
    const itemCount = Number(textSegments[0].split(" ")[0]);
    const sequenceElements = textSegments[1].split(' ').map(Number);

    const resultingOrder = sequenceElements.reduce((accumulatorArray, currentElementValue, currentPositionIndex) => {
        accumulatorArray[currentElementValue] = currentPositionIndex + 1;
        return accumulatorArray;
    }, []);

    console.log(resultingOrder.join(' '));
}

executeTransformation(obtainContentFromSource());