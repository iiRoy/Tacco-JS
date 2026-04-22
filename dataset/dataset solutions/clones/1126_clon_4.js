const constructSpatialDatum = (hVal, vVal) => ({ h: hVal, v: vVal });

const retrieveSourceMaterial = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericalRepresentation = (textualInput) => parseInt(textualInput, 10);

const processRawDataSegments = (segments) => {
    const totalEntries = parseNumericalRepresentation(segments[0]);
    const collectionOfItems = [];
    for (let currentEntryIndex = 1; currentEntryIndex <= totalEntries; currentEntryIndex++) {
        const axisComponents = segments[currentEntryIndex].split(' ');
        collectionOfItems.push(
            constructSpatialDatum(
                parseNumericalRepresentation(axisComponents[0]),
                parseNumericalRepresentation(axisComponents[1])
            )
        );
    }
    return collectionOfItems;
};

const locatePrimaryReference = (dataSequence) => {
    return dataSequence.reduce((currentBest, currentElement, currentElementIndex) => {
        if (currentElement.v < currentBest.item.v) {
            return { item: currentElement, position: currentElementIndex };
        }
        if (currentElement.v === currentBest.item.v && currentElement.h < currentBest.item.h) {
            return { item: currentElement, position: currentElementIndex };
        }
        return currentBest;
    }, { item: dataSequence[0], position: 0 });
};

const reorderCollection = (initialCollection, referenceElementInfo) => {
    const leadingElement = referenceElementInfo.item;
    const remainingElements = initialCollection.filter((_, idx) => idx !== referenceElementInfo.position);
    return [leadingElement, ...remainingElements];
};

const rawContent = retrieveSourceMaterial();
const contentLines = rawContent.split('\n');
const initialCoordinateSet = processRawDataSegments(contentLines);

const referencePointData = locatePrimaryReference(initialCoordinateSet);
const finalArrangement = reorderCollection(initialCoordinateSet, referencePointData);

console.log(finalArrangement);