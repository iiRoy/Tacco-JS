const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const rawEntries = sourceData.trim().split('\n');

const totalEntries = parseInt(rawEntries[0], 10);
const payloadEntries = rawEntries.slice(1);

const processedTuples = payloadEntries.map(entryLine => {
    const segments = entryLine.split(' ');
    return [segments[0], parseInt(segments[1], 10)];
});

const initialAccumulatorState = {
    flattenedStructure: [],
    lastEncounteredSymbol: null
};

const finalSequence = processedTuples.reduce((accumulatorObject, currentTuple) => {
    const [symbolComponent, valueComponent] = currentTuple;
    if (symbolComponent === accumulatorObject.lastEncounteredSymbol) {
        accumulatorObject.flattenedStructure[accumulatorObject.flattenedStructure.length - 1] += valueComponent;
    } else {
        accumulatorObject.flattenedStructure.push(symbolComponent);
        accumulatorObject.flattenedStructure.push(valueComponent);
        accumulatorObject.lastEncounteredSymbol = symbolComponent;
    }
    return accumulatorObject;
}, initialAccumulatorState).flattenedStructure;

const resultLength = finalSequence.length;

if (resultLength % 4 !== 0) {
    console.log("NO");
    return;
}

const checkStructureIntegrity = (sequenceToVerify) => {
    const groupedSections = sequenceToVerify.reduce((sections, element, index) => {
        const sectionIndex = Math.floor(index / 4);
        if (!sections[sectionIndex]) {
            sections[sectionIndex] = [];
        }
        sections[sectionIndex].push(element);
        return sections;
    }, []);

    const integrityStatus = groupedSections.every(individualSection => {
        if (individualSection.length !== 4) return false;
        const [openingIndicator, firstValue, closingIndicator, secondValue] = individualSection;
        return (
            openingIndicator === '(' &&
            typeof firstValue === 'number' &&
            closingIndicator === ')' &&
            typeof secondValue === 'number' &&
            firstValue === secondValue
        );
    });
    return integrityStatus;
};

if (checkStructureIntegrity(finalSequence)) {
    console.log("YES");
} else {
    console.log("NO");
}