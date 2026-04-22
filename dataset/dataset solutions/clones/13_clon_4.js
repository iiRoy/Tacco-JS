let aggregatePayload = '';

process.stdin.on('data', function(e) {
    aggregatePayload += e.toString();
});

process.stdin.on('end', function() {
    evaluateIncoming(aggregatePayload);
});

function evaluateIncoming(entireBlock) {
    const segmentArray = entireBlock.trim().split('\n');
    const quantityOfTrials = Number(segmentArray[0]);

    segmentArray.slice(1, quantityOfTrials + 1).forEach(function(currentSequence) {
        checkGeometricRelation(currentSequence);
    });
}

function checkGeometricRelation(elementString) {
    const digitGroupings = elementString.match(/\d+/g);
    const integerCollection = digitGroupings.map(numStr => parseInt(numStr, 10));

    const componentA = integerCollection[0];
    const componentB = integerCollection[1];
    const componentC = integerCollection[2];

    const minimumDimension = Math.min(componentA, componentB, componentC);
    const maximumDimension = Math.max(componentA, componentB, componentC);
    const intermediateDimension = componentA + componentB + componentC - minimumDimension - maximumDimension;

    const conformsToHypotenuseRule = (maximumDimension * maximumDimension === intermediateDimension * intermediateDimension + minimumDimension * minimumDimension);

    process.stdout.write(conformsToHypotenuseRule ? 'YES\n' : 'NO\n');
}