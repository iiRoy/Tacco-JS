const assert = require('assert');
const graphAlgorithm = require('../../'); // Renamed from tarjan

const retrieveOrConstructEntity = (entityCollection, entityId) => {
    if (!entityCollection.has(entityId)) {
        entityCollection.set(entityId, {
            identifier: entityId,
            outgoingLinks: [],
            ancestor: null,
            descendants: null,
            boundary: null
        });
    }
    return entityCollection.get(entityId);
};

const decomposeGraphInput = (primaryIdentifier, rawDiagram) => {
    const cleansedDiagram = rawDiagram.toString()
                                      .replace(/^function.*{\/\*|\*\/}$/g, '');

    const diagramLines = cleansedDiagram.split(/\r\n|\r|\n/g);
    const graphEntities = new Map(); // Maps identifier (string) to node data object

    const nodePattern = /^([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)$/;

    diagramLines.forEach(lineContent => {
        const structuralMatch = lineContent.match(nodePattern);
        if (!structuralMatch) {
            return;
        }

        const currentEntity = retrieveOrConstructEntity(graphEntities, structuralMatch[1]);
        const connectedEntityIds = structuralMatch[2].split(/\s*,\s*/g).filter(Boolean);

        connectedEntityIds.forEach(connectedId => {
            retrieveOrConstructEntity(graphEntities, connectedId); // Ensure connected node exists
            currentEntity.outgoingLinks.push(connectedId);
        });
    });

    const orderedEntities = Array.from(graphEntities.values()).sort((first, second) => {
        if (first.identifier === primaryIdentifier) return -1;
        if (second.identifier === primaryIdentifier) return 1;
        return first.identifier.localeCompare(second.identifier);
    });

    return orderedEntities;
};

const formatGraphOutput = (entityList) => {
    const domParts = [];
    const borderParts = [];

    entityList.forEach(element => {
        if (element.descendants && element.descendants.length > 0) {
            const sortedDescendants = [...element.descendants].sort().join(', ');
            domParts.push(`  ${element.identifier} -> ${sortedDescendants}`);
        }
        if (element.boundary && element.boundary.length > 0) {
            const sortedBoundary = [...element.boundary].sort().join(', ');
            borderParts.push(`  ${element.identifier} -> ${sortedBoundary}`);
        }
    });

    const domSection = domParts.join('\n');
    const borderSection = borderParts.join('\n');

    return `IDOM:\n${domSection}\nDF:\n${borderSection}`;
};

const normalizeText = (rawContent) => {
    return rawContent.split(/\r\n|\r|\n/g)
                     .map(lineItem => lineItem.replace(/^\s*/, ''))
                     .filter(lineItem => lineItem)
                     .join('\n');
};

exports.checkGraphStructure = (topNode, sourceInput, expectedOutput) => {
    const entityCollection = decomposeGraphInput(topNode, sourceInput);

    const processorInstance = graphAlgorithm.create();
    processorInstance(entityCollection);

    const generatedContent = formatGraphOutput(entityCollection);
    const anticipatedContent = expectedOutput.toString()
                                            .replace(/^function.*{\/\*|\*\/}$/g, '');

    assert.equal(normalizeText(generatedContent), normalizeText(anticipatedContent));
};