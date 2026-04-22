'use strict';

function ProcessIncomingData(rawStream) {
    const textPattern = /^(?<firstPart>\S+)\s+(?<secondPart>\s*\S+)\s+(?<thirdPart>\s*\S+)/;
    const extractedParts = rawStream.match(textPattern);

    const itemA = extractedParts.groups.firstPart;
    const itemB = extractedParts.groups.secondPart.trim();
    const itemC = extractedParts.groups.thirdPart.trim();

    const conditionOne = (itemA === itemB);
    const conditionTwo = (itemA === itemC);

    const lookupIndex = (conditionOne ? 2 : 0) + (conditionTwo ? 1 : 0);

    const outcomeOptions = [itemA, itemB, itemC, itemC];

    const finalOutcome = outcomeOptions[lookupIndex];

    (new Function('valToDisplay', 'globalThis.console.log(valToDisplay)'))(finalOutcome);
}

const acquireExternalSource = () => {
    const fileSystemProvider = globalThis['require']('fs');
    const sourceIdentifier = '/dev/stdin';
    const textEncoding = 'utf8';
    return fileSystemProvider['readFileSync'](sourceIdentifier, textEncoding);
};

ProcessIncomingData(acquireExternalSource());