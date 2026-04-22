function refineString(inputStr) {
    return inputStr.replace(/^\s+|\s+$/g, '');
}

function ElementUnit(kind, documentHolder) {
    this.containingDocument = documentHolder;
    this.unitKind = kind; // 1: element, 3: text, 9: primary container
    this.tagSymbol = '';
    this.unitValue = '';
    this.props = {}; // for attributes
    this.uniqueId = 0;
    this.parentRefId = -1; // For flat list reconstruction

    // Tree structure
    this.ancestor = null;
    this.descendants = [];
    this.firstborn = null;
    this.lastborn = null;
    this.nextAdjacent = null;
    this.prevAdjacent = null;

    // Display properties
    this.originX = 0;
    this.originY = 0;
    this.positionX = 0;
    this.positionY = 0;
    this.drawnWidth = 0;
    this.drawnHeight = 0;
}

function DisplayDocument() {
    this.allUnits = []; // Flat list of all units, indexed by uniqueId
    this.mainContainer = null;
    this.documentTitle = null;
}

// Recursive traversal for query methods
ElementUnit.prototype.scanDescendants = function(handlerCallback) {
    for (const child of this.descendants) {
        if (!handlerCallback.call(null, child)) {
            return child;
        }
        const foundInChild = child.scanDescendants(handlerCallback);
        if (foundInChild) {
            return foundInChild;
        }
    }
    return null;
};

ElementUnit.prototype.fetchFirstTaggedElement = function(symbol) {
    const selectAll = symbol === '*';
    return this.scanDescendants(function(unit){
        return !(selectAll || unit.tagSymbol === symbol);
    });
};

ElementUnit.prototype.fetchTaggedElements = function(symbol) {
    const selectAll = symbol === '*';
    const collection = [];
    this.scanDescendants(function(unit){
        if (selectAll || unit.tagSymbol === symbol) {
            collection.push(unit);
        }
        return true;
    });
    return collection;
};

ElementUnit.prototype.fetchNamedElements = function(nm) {
    const collection = [];
    this.scanDescendants(function(unit){
        if (unit.props && unit.props.name === nm) {
            collection.push(unit);
        }
        return true;
    });
    return collection;
};

ElementUnit.prototype.fetchElementById = function(idVal) {
    return this.scanDescendants(function(unit){
        return !(unit.props && unit.props.id === idVal);
    });
};

ElementUnit.prototype.retrieveProperty = function(propName) {
    return this.props[propName];
};

ElementUnit.prototype.assignProperty = function(propName, propValue) {
    this.props[propName] = propValue;
};

function outputTrace(message) {
    if (window.console) {
        console.log(message);
    }
}

function ingestMarkup(sourceString) {
    const structure = new DisplayDocument();
    let currentInputPosition = 0;
    let activeElementStack = [];
    
    const rootPseudoElement = new ElementUnit(1, structure);
    rootPseudoElement.tagSymbol = '#document_root';
    activeElementStack.push(rootPseudoElement);

    let currentActiveElement = rootPseudoElement;

    const createAndConnectUnit = (knd, tag, val, propMap) => {
        const newUnit = new ElementUnit(knd, structure);
        newUnit.tagSymbol = tag;
        newUnit.unitValue = val;
        newUnit.props = propMap || {};

        if (currentActiveElement) {
            newUnit.ancestor = currentActiveElement;
            if (!currentActiveElement.firstborn) {
                currentActiveElement.firstborn = newUnit;
            }
            if (currentActiveElement.lastborn) {
                currentActiveElement.lastborn.nextAdjacent = newUnit;
                newUnit.prevAdjacent = currentActiveElement.lastborn;
            }
            currentActiveElement.lastborn = newUnit;
            currentActiveElement.descendants.push(newUnit);
        }
        return newUnit;
    };

    const parseAttributeString = (attrStr) => {
        const attrs = {};
        const attributeMatcher = /(\w+)(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))?/g;
        let attrMatch;
        while ((attrMatch = attributeMatcher.exec(attrStr)) !== null) {
            const name = attrMatch[1];
            const value = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';
            attrs[name] = value;
        }
        return attrs;
    };

    while (currentInputPosition < sourceString.length) {
        const tagStart = sourceString.indexOf('<', currentInputPosition);

        if (tagStart === -1) {
            const textContent = sourceString.substring(currentInputPosition);
            if (refineString(textContent).length > 0) {
                createAndConnectUnit(3, '#text', refineString(textContent), null);
            }
            currentInputPosition = sourceString.length;
            break;
        }

        if (tagStart > currentInputPosition) {
            const textContent = sourceString.substring(currentInputPosition, tagStart);
            if (refineString(textContent).length > 0) {
                createAndConnectUnit(3, '#text', refineString(textContent), null);
            }
        }

        const tagEnd = sourceString.indexOf('>', tagStart);
        if (tagEnd === -1) {
            const remaining = sourceString.substring(tagStart);
            if (refineString(remaining).length > 0) {
                createAndConnectUnit(3, '#text', refineString(remaining), null);
            }
            currentInputPosition = sourceString.length;
            break;
        }

        const tagContents = sourceString.substring(tagStart + 1, tagEnd);
        currentInputPosition = tagEnd + 1;

        if (tagContents.startsWith('!--')) {
            const commentEnd = sourceString.indexOf('-->', currentInputPosition - 1);
            if (commentEnd !== -1) {
                currentInputPosition = commentEnd + 3;
            }
            continue;
        }

        const isClosingTag = tagContents.startsWith('/');
        const isSelfClosing = tagContents.endsWith('/');

        let tagSymbolRaw = '';
        let attributesString = '';

        if (isClosingTag) {
            tagSymbolRaw = tagContents.substring(1);
            if (tagSymbolRaw.endsWith('/')) tagSymbolRaw = tagSymbolRaw.slice(0, -1);
            tagSymbolRaw = refineString(tagSymbolRaw.split(/\s+/)[0]).toLowerCase();

            while (activeElementStack.length > 1 && activeElementStack[activeElementStack.length - 1].tagSymbol !== tagSymbolRaw) {
                activeElementStack.pop();
            }
            if (activeElementStack.length > 1 && activeElementStack[activeElementStack.length - 1].tagSymbol === tagSymbolRaw) {
                activeElementStack.pop();
            }
            currentActiveElement = activeElementStack[activeElementStack.length - 1];
        } else {
            let parts = tagContents.split(/\s+/);
            tagSymbolRaw = parts[0].toLowerCase();
            if (isSelfClosing && tagSymbolRaw.endsWith('/')) tagSymbolRaw = tagSymbolRaw.slice(0, -1);

            attributesString = tagContents.substring(parts[0].length);
            if (isSelfClosing && attributesString.endsWith('/')) attributesString = attributesString.slice(0, -1);
            
            const elementProps = parseAttributeString(attributesString);

            let unitKind = 1;
            if (tagSymbolRaw === 'body') unitKind = 9;
            else if (tagSymbolRaw === 'title') unitKind = 2;

            const newUnit = createAndConnectUnit(unitKind, tagSymbolRaw, '', elementProps);

            if (!isSelfClosing) {
                activeElementStack.push(newUnit);
                currentActiveElement = newUnit;
            }
        }
    }
    
    // Flatten the tree into allUnits and assign uniqueIds and parentRefIds
    const finalUnitsList = [];
    const collectUnits = (unit) => {
        unit.uniqueId = finalUnitsList.length;
        finalUnitsList.push(unit);
        unit.descendants.forEach(collectUnits);
    };
    rootPseudoElement.descendants.forEach(collectUnits);
    structure.allUnits = finalUnitsList;

    structure.allUnits.forEach(unit => {
        if (unit.ancestor && unit.ancestor !== rootPseudoElement) {
            unit.parentRefId = unit.ancestor.uniqueId;
        } else {
            unit.parentRefId = -1;
        }
    });
    
    structure.mainContainer = structure.allUnits.find(u => u.tagSymbol === 'body' && u.unitKind === 9) || null;
    structure.documentTitle = structure.allUnits.find(u => u.tagSymbol === 'title' && u.unitKind === 2) || null;

    return structure;
}

function visualizeDocument(documentStructure, canvasElementId) {
    const graphicContext = document.getElementById(canvasElementId).getContext("2d");

    graphicContext.font = "12pt Arial";
    graphicContext.textAlign = "left";
    graphicContext.textBaseline = "top";
    graphicContext.fillStyle = "rgb(0, 0, 0, 1.0)";
    graphicContext.strokeStyle = "rgb(1, 0, 0, 1.0)";

    const rootContainer = documentStructure.mainContainer;
    if (!rootContainer) {
        outputTrace("No primary container for display.");
        return;
    }

    const processDisplayUnit = (unit, flowState) => {
        let currentFlowX = flowState.flowX;
        let currentFlowY = flowState.flowY;
        let blockOriginX = flowState.blockX;
        let blockOriginY = flowState.blockY;
        
        unit.originX = blockOriginX;
        unit.originY = blockOriginY;
        unit.positionX = currentFlowX;
        unit.positionY = currentFlowY;

        let maxChildFlowX = currentFlowX;
        let maxChildFlowY = currentFlowY;

        for (let i = 0; i < unit.descendants.length; i++) {
            const child = unit.descendants[i];

            let childFlowXForLayout = currentFlowX;
            let childFlowYForLayout = currentFlowY;
            let childBlockXForLayout = blockOriginX;
            let childBlockYForLayout = blockOriginY;

            if (child.prevAdjacent && child.prevAdjacent.tagSymbol === 'p') {
                childFlowXForLayout = blockOriginX;
                childFlowYForLayout = maxChildFlowY; 
                childBlockXForLayout = blockOriginX;
                childBlockYForLayout = maxChildFlowY;
            }

            const childLayoutResult = processDisplayUnit(child, {
                flowX: childFlowXForLayout,
                flowY: childFlowYForLayout,
                blockX: childBlockXForLayout,
                blockY: childBlockYForLayout,
                lineHeight: flowState.lineHeight
            });

            currentFlowX = childLayoutResult.nextFlowX;
            currentFlowY = childLayoutResult.nextFlowY;

            maxChildFlowX = Math.max(maxChildFlowX, childLayoutResult.blockX + childLayoutResult.unitWidth);
            maxChildFlowY = Math.max(maxChildFlowY, childLayoutResult.blockY + childLayoutResult.unitHeight);
        }

        if (unit.unitKind === 3) {
            const originalFont = graphicContext.font;
            if (unit.ancestor && unit.ancestor.tagSymbol === 'b') {
                graphicContext.font = "bold 12pt Arial";
            } else {
                graphicContext.font = "12pt Arial";
            }
            const metrics = graphicContext.measureText(unit.unitValue);
            unit.drawnWidth = metrics.width;
            unit.drawnHeight = flowState.lineHeight;
            graphicContext.font = originalFont;

            graphicContext.fillText(unit.unitValue, unit.positionX, unit.positionY);
            outputTrace(`${unit.unitValue} at ${unit.positionX}, ${unit.positionY}`);
            
            currentFlowX = unit.positionX + unit.drawnWidth;
            currentFlowY = unit.positionY;
        } else {
            unit.drawnWidth = maxChildFlowX - unit.originX;
            unit.drawnHeight = maxChildFlowY - unit.originY;

            if (unit.tagSymbol === 'p') {
                currentFlowX = blockOriginX;
                currentFlowY = unit.originY + unit.drawnHeight;
            }
        }

        return {
            nextFlowX: currentFlowX,
            nextFlowY: currentFlowY,
            unitWidth: unit.drawnWidth,
            unitHeight: unit.drawnHeight,
            blockX: blockOriginX,
            blockY: blockOriginY
        };
    };

    let currentDocumentFlowState = {
        flowX: 0,
        flowY: 0,
        blockX: 0,
        blockY: 0,
        lineHeight: 14
    };

    for (const childOfBody of rootContainer.descendants) {
        const result = processDisplayUnit(childOfBody, currentDocumentFlowState);
        
        currentDocumentFlowState.flowX = result.nextFlowX;
        currentDocumentFlowState.flowY = result.nextFlowY;

        if (childOfBody.tagSymbol === 'p') {
            currentDocumentFlowState.flowX = 0;
            currentDocumentFlowState.flowY = childOfBody.originY + childOfBody.drawnHeight;
        }
    }
}