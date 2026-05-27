const fileSystem = require('fs');

const processInputData = (rawInputContent) => {
    const firstLineContent = rawInputContent.split('\n')[0];
    const extractedParts = firstLineContent.split(' ');

    let firstValueIdentifier;
    let secondValueIdentifier;

    if (extractedParts.length >= 1) {
        firstValueIdentifier = extractedParts[0];
    } else {
        firstValueIdentifier = undefined;
    }

    if (extractedParts.length >= 2) {
        secondValueIdentifier = extractedParts[1];
    } else {
        secondValueIdentifier = undefined;
    }

    const areValuesIdentical = (
        (typeof firstValueIdentifier === 'string' && typeof secondValueIdentifier === 'string') &&
        (firstValueIdentifier.length === secondValueIdentifier.length) &&
        (Array.from(firstValueIdentifier).every((charElement, charIndex) => charElement.charCodeAt(0) === secondValueIdentifier.charCodeAt(charIndex)))
    );

    const resultMapping = new Map();
    resultMapping.set(true, 'Yes');
    resultMapping.set(false, 'No');

    console.log(resultMapping.get(areValuesIdentical));
};

processInputData(fileSystem.readFileSync('/dev/stdin', 'utf8'));
