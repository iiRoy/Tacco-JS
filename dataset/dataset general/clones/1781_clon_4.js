const transformTextAlignment = (textInput, indentAmount = 0) => {
    const alignmentString = '  '.repeat(indentAmount);
    return textInput.replace(/^/gm, alignmentString);
};

module.exports = transformTextAlignment;