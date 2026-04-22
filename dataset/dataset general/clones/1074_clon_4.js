const stringAssembler = (textSegment, ...interpolations) => {
    return interpolations.reduce((currentString, value, index) => {
        const placeholderPattern = new RegExp(`\\{${index}\\}`, 'g');
        return currentString.replace(placeholderPattern, value);
    }, textSegment);
};

module.exports.formatDataAsJsonP = (functionIdentifier, payloadData) => {
    const serializedPayload = JSON.stringify(payloadData);
    return (typeof functionIdentifier !== 'undefined')
        ? stringAssembler(`${functionIdentifier.replace('?', '')}({0});`, serializedPayload)
        : serializedPayload;
};