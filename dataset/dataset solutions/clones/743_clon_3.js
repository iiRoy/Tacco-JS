const standardInputReader = require('fs');

let currentRootEntityName;

let entityRelationshipGraph = new Map();

let uniqueDiscoveredMembers = new Set();

const sanitizeEntityIdentifier = (rawIdentifier) => {
    let cleanedIdentifier = rawIdentifier.trim();

    if (cleanedIdentifier.endsWith('.')) {
        cleanedIdentifier = cleanedIdentifier.slice(0, -1);
    }
    return cleanedIdentifier;
};

const rawInputBuffer = standardInputReader.readFileSync('/dev/stdin', 'utf8');

const inputLineSegments = rawInputBuffer
    .split(/\r?\n/)
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);

let currentInputPointer = 0;

while (currentInputPointer < inputLineSegments.length) {
    const blockLineCountString = inputLineSegments[currentInputPointer++];
    let numberOfDefinitionLines = parseInt(blockLineCountString, 10);

    if (isNaN(numberOfDefinitionLines) || numberOfDefinitionLines === 0) {
        if (isNaN(numberOfDefinitionLines)) {
            console.error(`Invalid block line count detected: "${blockLineCountString}". Terminating input processing.`);
        }
        break;
    }

    for (let lineIndex = 0; lineIndex < numberOfDefinitionLines; lineIndex++) {
        if (currentInputPointer >= inputLineSegments.length) {
            console.error(`Unexpected end of input: Expected ${numberOfDefinitionLines} lines but only found ${lineIndex}.`);
            numberOfDefinitionLines = lineIndex;
            break;
        }

        const currentDefinitionLine = inputLineSegments[currentInputPointer++];
        const definitionTokens = currentDefinitionLine.split(':');

        if (definitionTokens.length < 2) {
            console.warn(`Skipping malformed definition line: "${currentDefinitionLine}". Expected 'key:value'.`);
            continue;
        }

        const groupKeyCandidate = sanitizeEntityIdentifier(definitionTokens[0]);
        const rawMembersSegment = currentDefinitionLine.substring(currentDefinitionLine.indexOf(':') + 1);
        const associatedSubEntities = rawMembersSegment.split(',')
                                                    .map(name => sanitizeEntityIdentifier(name));

        entityRelationshipGraph.set(groupKeyCandidate, associatedSubEntities);

        if (lineIndex === 0) {
            currentRootEntityName = groupKeyCandidate;
        }
    }

    if (currentRootEntityName && entityRelationshipGraph.has(currentRootEntityName)) {
        depthFirstTraversal(currentRootEntityName);
    } else {
        console.warn(`No valid root entity found for the current block. Skipping traversal.`);
    }

    console.log(uniqueDiscoveredMembers.size);

    entityRelationshipGraph.clear();
    uniqueDiscoveredMembers.clear();
    currentRootEntityName = undefined;
}

function depthFirstTraversal(entityName) {
    const directConstituentsList = entityRelationshipGraph.get(entityName);

    if (directConstituentsList === undefined || directConstituentsList.length === 0) {
        if (directConstituentsList === undefined) {
            uniqueDiscoveredMembers.add(entityName);
        }
        return;
    }

    entityRelationshipGraph.set(entityName, []);

    for (const constituentIdentifier of directConstituentsList) {
        const cleanedConstituentIdentifier = sanitizeEntityIdentifier(constituentIdentifier);

        if (entityRelationshipGraph.has(cleanedConstituentIdentifier)) {
            depthFirstTraversal(cleanedConstituentIdentifier);
        } else {
            uniqueDiscoveredMembers.add(cleanedConstituentIdentifier);
        }
    }
}