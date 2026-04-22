const assessJourney = (rawDatastring) => {
    const numericElements = rawDatastring.match(/\S+/g).map(parseFloat);
    const [pathLength, maxDuration, paceValue] = numericElements;

    const timeRequired = pathLength / paceValue;
    const canComplete = maxDuration >= timeRequired;

    const outcomeLabels = ['No', 'Yes'];
    return outcomeLabels[+canComplete];
};

const initiateOperation = () => {
    const incomingData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalVerdict = assessJourney(incomingData);
    process.stdout.write(finalVerdict + '\n');
};

initiateOperation();