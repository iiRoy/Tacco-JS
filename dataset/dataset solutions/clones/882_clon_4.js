const fileSystemInterface = require('fs');

const handleNoChange = () => '.';

const handleMinorChange = (numRepeats, symbolToRepeat) => symbolToRepeat.repeat(numRepeats);

const handleMajorChange = (totalMagnitude, symbolToRepeat) => {
    const squareRootInteger = Math.floor(Math.sqrt(totalMagnitude));
    const remainingDifference = totalMagnitude - squareRootInteger * squareRootInteger;
    return `>${'+'.repeat(squareRootInteger)}[<${symbolToRepeat.repeat(squareRootInteger)}>-]<${symbolToRepeat.repeat(remainingDifference)}`;
};

const processCharacterSequence = (initialText) => {
    const thresholdConstant = 160;

    const codePoints = Array.from(initialText).map(character => character.charCodeAt(0));

    const finalResult = codePoints.reduce(
        (currentContext, presentValue) => {
            let [producedSequence, priorValue] = currentContext;
            const valueDelta = presentValue - priorValue;
            const absDelta = Math.abs(valueDelta);
            const opSign = valueDelta > 0 ? '+' : '-';

            let generatedPart = '';
            if (valueDelta === 0) {
                generatedPart = handleNoChange();
            } else if (absDelta < thresholdConstant) {
                generatedPart = handleMinorChange(absDelta, opSign);
            } else {
                generatedPart = handleMajorChange(absDelta, opSign);
            }

            return [`${producedSequence}${generatedPart}.`, presentValue];
        },
        ['', 0]
    );

    return finalResult[0];
};

const obtainInputAndExecute = () => {
    const standardInputDescriptor = process.stdin.fd;
    const dataSizeInBytes = fileSystemInterface.fstatSync(standardInputDescriptor).size;
    const dataContainer = Buffer.alloc(dataSizeInBytes);
    const actualBytesRead = fileSystemInterface.readSync(standardInputDescriptor, dataContainer, 0, dataSizeInBytes, 0);
    const rawContent = dataContainer.toString('utf8', 0, actualBytesRead);
    const inputLine = rawContent.split('\n')[0];

    const outputString = processCharacterSequence(inputLine);
    console.log(outputString);
};

obtainInputAndExecute();