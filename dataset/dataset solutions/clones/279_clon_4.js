const acquireText = require('node:fs').readFileSync;

const processSourceContent = (sourceContent) => {
    const purgeDelimiter = (text) => text.split(',').join('');
    const cutWhitespace = (text) => text.replace(/^\s+|\s+$/g, '');
    const tokenizeContent = (text) => text.match(/\S+/g) || [];

    const noCommas = purgeDelimiter(sourceContent);
    const trimmedText = cutWhitespace(noCommas);
    return tokenizeContent(trimmedText);
};

const inputUnits = processSourceContent(acquireText('/dev/stdin', 'utf8'));

const containsSeparator = (textUnit) => textUnit.includes('.');
const determineCoreLength = (textUnit) => textUnit.replace(/\./g, '').length;
const isValidCoreLength = (len) => len >= 3 && len <= 6;
const terminatesWithSeparator = (textUnit) => textUnit.endsWith('.');
const stripSeparators = (textUnit) => textUnit.replace(/\./g, '');

const initialProcessingState = {
    activeFragment: '',
    completedSections: []
};

const aggregateProcessor = (state, lexicalUnit) => {
    let { activeFragment, completedSections } = state;

    const hasDelimiter = containsSeparator(lexicalUnit);
    const coreLength = determineCoreLength(lexicalUnit);
    const isCoreLengthValid = isValidCoreLength(coreLength);
    const isUnitLengthValid = isValidCoreLength(lexicalUnit.length);

    if (hasDelimiter) {
        if (isCoreLengthValid) {
            if (terminatesWithSeparator(lexicalUnit)) {
                activeFragment += stripSeparators(lexicalUnit);
                completedSections.push(activeFragment);
            } else {
                activeFragment += lexicalUnit;
                completedSections.push(activeFragment);
            }
            activeFragment = '';
        } else {
            completedSections.push(activeFragment);
            activeFragment = '';
        }
    } else {
        if (isUnitLengthValid) {
            activeFragment += lexicalUnit + ' ';
        }
    }

    return { activeFragment, completedSections };
};

const finalStructure = inputUnits.reduce(aggregateProcessor, initialProcessingState);

finalStructure.completedSections.forEach(section => {
    process.stdout.write(section + '\n');
});