const sourceMaterial = require('node:fs').readFileSync(0, 'utf8');
const contentLines = sourceMaterial.split('\n').map(l => l.trim()).filter(Boolean);

let currentLineIndex = 0;

function acquireNextDatum() {
    return contentLines[currentLineIndex++];
}

function deriveExtentMeasures(sourceValues) {
    let measureOccurrences = new Map();
    sourceValues.forEach((_, initialIndex) => {
        sourceValues.slice(initialIndex).reduce((accumulator, currentElement) => {
            const newTotal = accumulator + currentElement;
            measureOccurrences.set(newTotal, (measureOccurrences.get(newTotal) || 0) + 1);
            return newTotal;
        }, 0);
    });
    return measureOccurrences;
}

function tallyConcordantDimensions(primaryMeasures, secondaryMeasures) {
    return Array.from(primaryMeasures.entries()).reduce((aggregate, [measureValue, primaryCount]) => {
        return aggregate + (secondaryMeasures.has(measureValue) ? primaryCount * secondaryMeasures.get(measureValue) : 0);
    }, 0);
}

function processAllDatasets() {
    const collectedOutcomes = [];
    while (true) {
        const structuralSpecifier = acquireNextDatum();
        if (structuralSpecifier === "0 0") {
            break;
        }

        const [dimA_count, dimB_count] = structuralSpecifier.split(' ').map(Number);

        const dimA_values = Array.from({ length: dimA_count }, () => +acquireNextDatum());
        const dimB_values = Array.from({ length: dimB_count }, () => +acquireNextDatum());

        const frequenciesA = deriveExtentMeasures(dimA_values);
        const frequenciesB = deriveExtentMeasures(dimB_values);

        const finalTally = tallyConcordantDimensions(frequenciesA, frequenciesB);
        collectedOutcomes.push(finalTally);
    }
    return collectedOutcomes;
}

const results = processAllDatasets();
results.forEach(outcome => console.log(outcome));