var dataQueryEngine = {};

dataQueryEngine.v = function(varIdentifier) {
    // Unique marker for variable capture nodes
    return {
        __variableCaptureToken__: true,
        identifier: varIdentifier
    };
};

function deepReplicate(sourceItem) {
    if (sourceItem === null || typeof sourceItem !== 'object') {
        return sourceItem;
    }
    if (Array.isArray(sourceItem)) {
        return sourceItem.map(element => deepReplicate(element));
    }
    const replicated = {};
    for (const key in sourceItem) {
        if (Object.prototype.hasOwnProperty.call(sourceItem, key)) {
            replicated[key] = deepReplicate(sourceItem[key]);
        }
    }
    return replicated;
}

function assessMatch(dataElement, patternElement, currentVariableContext) {
    // 1. Handle variable capture tokens
    if (typeof patternElement === 'object' && patternElement !== null && patternElement.__variableCaptureToken__) {
        const variableName = patternElement.identifier;
        if (currentVariableContext.hasOwnProperty(variableName)) {
            // Variable already captured, ensure consistency
            return {
                isMatch: dataElement === currentVariableContext[variableName],
                updatedContext: currentVariableContext
            };
        } else {
            // Capture new variable
            const newContext = { ...currentVariableContext,
                [variableName]: dataElement
            };
            return {
                isMatch: true,
                updatedContext: newContext
            };
        }
    }

    // 2. Handle function patterns
    if (typeof patternElement === 'function') {
        return {
            isMatch: patternElement(dataElement),
            updatedContext: currentVariableContext
        };
    }

    // 3. Handle primitive values (null, undefined, string, number, boolean)
    if (dataElement === null || typeof dataElement !== 'object' || patternElement === null || typeof patternElement !== 'object') {
        return {
            isMatch: dataElement === patternElement,
            updatedContext: currentVariableContext
        };
    }

    // 4. Handle array patterns
    if (Array.isArray(patternElement)) {
        if (!Array.isArray(dataElement)) {
            return { isMatch: false };
        }
        if (patternElement.length === 0) {
            return { isMatch: true, updatedContext: currentVariableContext }; // Empty pattern array matches any data array
        }

        let temporaryContext = { ...currentVariableContext };
        let allPatternSubElementsMatched = true;

        for (const pSubElement of patternElement) {
            let pSubElementFoundMatch = false;
            for (const dSubElement of dataElement) {
                const result = assessMatch(dSubElement, pSubElement, temporaryContext);
                if (result.isMatch) {
                    temporaryContext = result.updatedContext;
                    pSubElementFoundMatch = true;
                    break;
                }
            }
            if (!pSubElementFoundMatch) {
                allPatternSubElementsMatched = false;
                break;
            }
        }
        return {
            isMatch: allPatternSubElementsMatched,
            updatedContext: temporaryContext
        };
    }

    // 5. Handle object patterns
    if (typeof patternElement === 'object' && patternElement !== null) {
        if (typeof dataElement !== 'object' || dataElement === null || Array.isArray(dataElement)) {
            return { isMatch: false };
        }

        let temporaryContext = { ...currentVariableContext };
        let allPropertiesMatched = true;

        for (const propKey in patternElement) {
            if (Object.prototype.hasOwnProperty.call(patternElement, propKey)) {
                if (!Object.prototype.hasOwnProperty.call(dataElement, propKey)) {
                    allPropertiesMatched = false;
                    break;
                }
                const result = assessMatch(dataElement[propKey], patternElement[propKey], temporaryContext);
                if (result.isMatch) {
                    temporaryContext = result.updatedContext;
                } else {
                    allPropertiesMatched = false;
                    break;
                }
            }
        }
        return {
            isMatch: allPropertiesMatched,
            updatedContext: temporaryContext
        };
    }

    return { isMatch: false }; // Should not be reached if all types are handled
}

function processRecursive(currentMutableNode, searchCriterion, onMatchAction) {
    let subMatchesCount = 0;
    let nodeToReturn = currentMutableNode; // This is the node reference in the mutable tree

    // Attempt to match the current node itself
    const matchOutcome = assessMatch(currentMutableNode, searchCriterion, {});

    if (matchOutcome.isMatch) {
        subMatchesCount++;
        if (onMatchAction) {
            // onMatchAction receives the actual node reference and captured variables
            const replacementResult = onMatchAction(currentMutableNode, matchOutcome.updatedContext);
            if (replacementResult !== undefined) {
                nodeToReturn = replacementResult; // The current node is replaced entirely
            }
        }
    }

    // Recurse into children, but ONLY if the node was not replaced by a primitive.
    // If it was replaced by an object/array, we recurse into *that* new object/array.
    // If it was not replaced, we recurse into the original children.
    if (typeof nodeToReturn === 'object' && nodeToReturn !== null) {
        if (Array.isArray(nodeToReturn)) {
            for (let i = 0; i < nodeToReturn.length; i++) {
                const childProcessingResult = processRecursive(nodeToReturn[i], searchCriterion, onMatchAction);
                nodeToReturn[i] = childProcessingResult.node; // Update child with its transformed version
                subMatchesCount += childProcessingResult.count;
            }
        } else { // It's an object
            for (const key in nodeToReturn) {
                if (Object.prototype.hasOwnProperty.call(nodeToReturn, key)) {
                    const childProcessingResult = processRecursive(nodeToReturn[key], searchCriterion, onMatchAction);
                    nodeToReturn[key] = childProcessingResult.node; // Update child with its transformed version
                    subMatchesCount += childProcessingResult.count;
                }
            }
        }
    }

    return { node: nodeToReturn, count: subMatchesCount };
}

dataQueryEngine.process = function(initialDataStructure, queryPattern, matchHandler, completionHandler) {
    // Create a single deep copy of the initial data structure to work on
    const workingDataStructure = deepReplicate(initialDataStructure);

    // Start the recursive processing from the root of the working data structure
    const finalProcessingResult = processRecursive(workingDataStructure, queryPattern, matchHandler);

    // Call the completion handler with the final transformed data structure and total matches
    completionHandler(finalProcessingResult.node, finalProcessingResult.count);
};