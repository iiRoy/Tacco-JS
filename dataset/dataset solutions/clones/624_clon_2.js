let rawTextContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const lineFragments = (rawTextContent.trim()).split("\n");

const numberOfEntries = lineFragments.shift();

let dataStore = {};

// Process each input line to populate the data structure
for (let entryIndex = 0; entryIndex < numberOfEntries; entryIndex++) {
    const lineComponents = lineFragments[entryIndex].split(" ");
    const currentIdentifier = lineComponents[0];

    // Initialize the counter for a new identifier if not present
    if (!dataStore.hasOwnProperty(currentIdentifier)) {
        dataStore[currentIdentifier] = 0;
    }
    // Accumulate the numeric value for the current identifier
    dataStore[currentIdentifier] += Number(lineComponents[1]);
}

let identifierKeys = [];

// Extract all unique keys from the data store
for (const keyName in dataStore) {
    identifierKeys.push(keyName);
}

// Sort the collected identifiers alphabetically
identifierKeys.sort();

let maximumKeyLength = 0;

// Determine the maximum string length among all identifiers
for (let ktr = 0; ktr < identifierKeys.length; ktr++) {
    if (maximumKeyLength < identifierKeys[ktr].length) {
        maximumKeyLength = identifierKeys[ktr].length;
    }
}

let orderedIdentifiers = [];

// Organize identifiers by length, maintaining alphabetical order within each length group
for (let currentLength = 1; currentLength <= maximumKeyLength; currentLength++) {
    const segment = identifierKeys.filter(function(elementValue) {
        return elementValue.length === currentLength;
    });
    orderedIdentifiers = orderedIdentifiers.concat(segment);
}

// Print the final ordered identifiers along with their associated aggregated values
for (let outputIdx = 0; outputIdx < orderedIdentifiers.length; outputIdx++) {
    console.log(orderedIdentifiers[outputIdx] + " " + dataStore[orderedIdentifiers[outputIdx]]);
}