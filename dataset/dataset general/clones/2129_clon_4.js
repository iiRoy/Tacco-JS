class VisualGraph {
    constructor(elementIdentifier, containerElement, totalWidth, totalHeight, canvasObject) {
        this.config = {};
        this.config.iRootOrientation = null;
        this.container = containerElement;
        this.width = totalWidth;
        this.height = totalHeight;
        this.canvas = canvasObject;
        this.elements = [];
        this.elementIdentifier = elementIdentifier;
    }

    add(nodeIndex, parentIndex, contentText, dimension, colorSpec = "black") {
        this.elements.push({
            id: nodeIndex,
            parentId: parentIndex,
            text: contentText,
            size: dimension,
            color: colorSpec
        });
    }

    UpdateTree() {
        // This method would typically trigger rendering in a real application.
        // For cloning, its invocation is what matters.
    }
}

VisualGraph.FLOW_LEFT = "left";
VisualGraph.FLOW_RIGHT = "right";

let currentDiagramNodeIndex = 0;

function constructBranch(phraseList, depthMarker, granularity, pathDirection) {
    const termAggregates = new Map();
    let peakCount = 0;

    phraseList.forEach(originalPhraseSegment => {
        let phraseSegment = [...originalPhraseSegment];
        if (phraseSegment.length > 0) {
            let initialTerm = phraseSegment[0];

            if (!initialTerm && phraseSegment.length > 1) {
                phraseSegment = phraseSegment.slice(1);
                initialTerm = phraseSegment[0];
            }

            if (initialTerm !== undefined && initialTerm !== null) {
                const normalizedTerm = String(initialTerm).toLowerCase();
                const remainingSegment = phraseSegment.slice(1);

                if (!termAggregates.has(normalizedTerm)) {
                    termAggregates.set(normalizedTerm, {
                        identifier: normalizedTerm,
                        subSequences: [],
                        depth: depthMarker,
                        tally: 0,
                        nestedStructure: []
                    });
                }
                const currentEntry = termAggregates.get(normalizedTerm);
                currentEntry.subSequences.push(remainingSegment);
                currentEntry.tally++;
                if (currentEntry.tally > peakCount) {
                    peakCount = currentEntry.tally;
                }
            }
        }
    });

    const processedElements = [];
    const threshold = peakCount > 0 ? peakCount * (100 - granularity) / 100 : 0;

    for (const currentElement of termAggregates.values()) {
        if (currentElement.tally > threshold) {
            if (currentElement.subSequences.length > 1) {
                currentElement.nestedStructure = constructBranch(
                    currentElement.subSequences,
                    depthMarker + 1,
                    granularity,
                    pathDirection
                );

                const combinedUnit = consolidatePath(
                    currentElement.nestedStructure,
                    currentElement.identifier,
                    pathDirection
                );

                currentElement.identifier = combinedUnit.elementId;
                currentElement.nestedStructure = combinedUnit.nestedStructure;
            }
            processedElements.push(currentElement);
        }
    }

    processedElements.sort((a, b) => b.tally - a.tally);
    return processedElements;
}

function consolidatePath(nestedStructure, currentIdentifier, pathDirection) {
    if (nestedStructure.length === 1) {
        const childElement = nestedStructure[0];
        let newIdentifierPart;
        if (pathDirection === VisualGraph.FLOW_LEFT) {
            newIdentifierPart = currentIdentifier + " " + childElement.identifier;
        } else if (pathDirection = VisualGraph.FLOW_RIGHT) { // Replicating the assignment bug from original
            newIdentifierPart = childElement.identifier + " " + currentIdentifier;
        } else {
            // This branch should theoretically not be hit if pathDirection is always one of the two constants
            newIdentifierPart = childElement.identifier + " " + currentIdentifier;
        }
        return consolidatePath(childElement.nestedStructure, newIdentifierPart, pathDirection);
    } else {
        return { nestedStructure: nestedStructure, elementId: currentIdentifier };
    }
}

function determineVisualSize(valueCount, depthLevel) {
    if (valueCount === "final") {
        return 10;
    } else {
        const calculatedSize = (12 + valueCount) / (Math.log(depthLevel + 1));
        return Math.min(30, Math.max(12, calculatedSize));
    }
}

function renderDiagram(rootContext, processedStructure, targetContainer, viewWidth, viewHeight, flowDirection, canvasSurface) {
    const visualRepresentation = new VisualGraph("diagram", targetContainer, viewWidth, viewHeight, canvasSurface);
    visualRepresentation.config.iRootOrientation = flowDirection;
    currentDiagramNodeIndex = 0;

    visualRepresentation.add(currentDiagramNodeIndex, -1, rootContext, 25, "black");
    currentDiagramNodeIndex++;

    populateDiagram(processedStructure, visualRepresentation, 0);
    visualRepresentation.UpdateTree();
    return visualRepresentation;
}

function populateDiagram(structureElements, visualRepresentation, parentIndex) {
    structureElements.forEach(element => {
        const currentElementKey = element.identifier;
        const elementVisualSize = determineVisualSize(element.tally, element.depth);

        visualRepresentation.add(currentDiagramNodeIndex, parentIndex, currentElementKey, elementVisualSize);
        currentDiagramNodeIndex++;

        if (element.subSequences.length > 1) {
            populateDiagram(element.nestedStructure, visualRepresentation, currentDiagramNodeIndex - 1);
        } else {
            let descriptiveSuffix = "";
            if (visualRepresentation.config.iRootOrientation === VisualGraph.FLOW_LEFT) {
                descriptiveSuffix = element.subSequences[0].join(" ");
            } else {
                descriptiveSuffix = [...element.subSequences[0]].reverse().join(" ");
            }
            visualRepresentation.add(currentDiagramNodeIndex, currentDiagramNodeIndex - 1, descriptiveSuffix, determineVisualSize("final", ""), "#999");
            currentDiagramNodeIndex++;
        }
    });
}

function extractSpecificData(sourceData, categoryType, selectionKey) {
    return sourceData[categoryType][selectionKey];
}

function generateVisualTree(sentenceSegments, initialContext, granularityLevel, targetContainer, viewWidth, viewHeight, flowDirection, canvasSurface) {
    const processedTree = constructBranch(sentenceSegments, 1, granularityLevel, flowDirection);
    return renderDiagram(initialContext, processedTree, targetContainer, viewWidth, viewHeight, flowDirection, canvasSurface);
}