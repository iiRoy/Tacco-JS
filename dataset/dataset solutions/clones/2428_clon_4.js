const evaluateInputPayload = (rawPayload) => {
    const [lengthDescriptor, dataSequence] = rawPayload.split('\n');
    const numericalLength = Number.parseInt(lengthDescriptor, 10);

    if ((numericalLength & 1) === 1) {
        console.log('No');
        return;
    }

    const halfLength = numericalLength / 2;
    const initialSegment = dataSequence.slice(0, halfLength);
    const terminalSegment = dataSequence.slice(halfLength, numericalLength);

    const comparisonResult = (initialSegment === terminalSegment);
    const responseLookup = {
        true: 'Yes',
        false: 'No'
    };
    console.log(responseLookup[comparisonResult]);
};

evaluateInputPayload(require("fs").readFileSync("/dev/stdin", "utf8"));