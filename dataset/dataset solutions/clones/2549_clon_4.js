function atmosphericObservation(currentCondition) {
    const transformationSet = [
        { initial: 'Sunny', next: 'Cloudy' },
        { initial: 'Cloudy', next: 'Rainy' },
        { initial: 'Rainy', next: 'Sunny' }
    ];

    const foundRule = transformationSet.find(entry => entry.initial === currentCondition);
    const predictedOutcome = foundRule ? foundRule.next : 'Other';

    const renderOutput = (message) => global.console.log(message);
    renderOutput(predictedOutcome);

    const sourceAccessor = global.require('fs');
    const dataStream = sourceAccessor.readFileSync('/dev/stdin', 'utf8');

    global.handleExternalData(dataStream);
}