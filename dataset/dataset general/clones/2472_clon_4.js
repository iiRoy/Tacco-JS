const codeDefinitions = [
    { label: 'bold', begin: 1, stop: 22 },
    { label: 'italic', begin: 3, stop: 23 },
    { label: 'underline', begin: 4, stop: 24 },
    { label: 'inverse', begin: 7, stop: 27 },
    { label: 'white', begin: 37, stop: 39 },
    { label: 'grey', begin: 90, stop: 39 },
    { label: 'black', begin: 90, stop: 39 },
    { label: 'blue', begin: 34, stop: 39 },
    { label: 'cyan', begin: 36, stop: 39 },
    { label: 'green', begin: 32, stop: 39 },
    { label: 'magenta', begin: 35, stop: 39 },
    { label: 'red', begin: 31, stop: 39 },
    { label: 'yellow', begin: 33, stop: 39 }
];

const applyEscapeSequence = (textSegment, openingCode, closingCode) => {
    return `\x1b[${openingCode}m${textSegment}\x1b[${closingCode}m`;
};

for (const currentDefinition of codeDefinitions) {
    Object.defineProperty(String.prototype, currentDefinition.label, {
        get: function() {
            return applyEscapeSequence(this.valueOf(), currentDefinition.begin, currentDefinition.stop);
        },
        configurable: true
    });
}