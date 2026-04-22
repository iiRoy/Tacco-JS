class DOMOperations {
    static elementRegistry = new Map();
    static navigationContext = null;
    static activeTarget = null;
    static _allocatedMemory = null;

    static #getCalculatedIndex(totalElements, entropyFactor) {
        return Math.round((totalElements * entropyFactor) / 100);
    }

    static selectArbitraryNode(entropyFactor) {
        const allNodes = document.getElementsByTagName('*');
        const nodeCount = allNodes.length;
        if (nodeCount === 0) return null;
        const selectedIndex = DOMOperations.#getCalculatedIndex(nodeCount, entropyFactor);
        return allNodes[selectedIndex];
    }

    static establishNavigationContext(nodeFilterValue) {
        DOMOperations.navigationContext = document.createTreeWalker(
            document,
            nodeFilterValue,
            {
                acceptNode: (currNode) => NodeFilter.FILTER_ACCEPT
            },
            false
        );
    }

    static recordElementReference(entropyFactor, identifier) {
        const designatedNode = DOMOperations.selectArbitraryNode(entropyFactor);
        if (designatedNode) {
            DOMOperations.elementRegistry.set(identifier, designatedNode);
            designatedNode.id = identifier;
        }
    }

    static retrieveRegisteredElement(entropyFactor) {
        if (DOMOperations.elementRegistry.size === 0) return null;
        const keys = Array.from(DOMOperations.elementRegistry.keys());
        const selectedKeyIndex = DOMOperations.#getCalculatedIndex(keys.length, entropyFactor);
        const selectedKey = keys[selectedKeyIndex];
        return document.getElementById(selectedKey);
    }

    static manipulateTargetFocus(operationType, nodeSelectionMethod, shouldClone, nodeEntropy, phantomEntropy, propertyEntropy, spareEntropy, useRegisteredNodes) {
        let sourceNode;
        if (useRegisteredNodes && DOMOperations.elementRegistry.size > 0) {
            sourceNode = DOMOperations.retrieveRegisteredElement(nodeEntropy);
        } else {
            sourceNode = DOMOperations.selectArbitraryNode(nodeEntropy);
        }

        if (DOMOperations.activeTarget) {
            const propertyTransferActions = {
                0: (dest, src) => {
                    for (const prop in src) {
                        try {
                            dest[prop] = src[prop];
                        } catch (e) { /* ignore */ }
                    }
                },
                1: (dest, src) => {
                    for (const prop in dest) {
                        try {
                            dest[prop] = src[prop];
                        } catch (e) { /* ignore */ }
                    }
                },
                2: (dest, src) => {
                    const baseLength = document.getElementsByTagName('*').length;
                    const propIdx1 = DOMOperations.#getCalculatedIndex(baseLength, propertyEntropy);
                    const propIdx2 = DOMOperations.#getCalculatedIndex(baseLength, propertyEntropy);
                    try {
                        dest[propIdx1] = src[propIdx2];
                    } catch (e) { /* ignore */ }
                }
            };
            const actionFunc = propertyTransferActions[operationType];
            if (actionFunc) {
                actionFunc(DOMOperations.activeTarget, sourceNode);
            }
        } else {
            if (DOMOperations.navigationContext && DOMOperations.navigationContext.currentNode) {
                let contextualNode = null;
                const nodeSelectionStrategies = {
                    0: () => DOMOperations.navigationContext.currentNode,
                    1: () => DOMOperations.navigationContext.previousSibling(),
                    2: () => DOMOperations.navigationContext.previousNode(),
                    3: () => DOMOperations.selectArbitraryNode(phantomEntropy)
                };
                const strategy = nodeSelectionStrategies[nodeSelectionMethod];
                if (strategy) {
                    contextualNode = strategy();
                }

                if (contextualNode) {
                    DOMOperations.activeTarget = shouldClone ? contextualNode.cloneNode(true) : contextualNode;
                }
            } else {
                DOMOperations.establishNavigationContext(NodeFilter.SHOW_ALL);
            }
        }
    }

    static contentTransformation(elementHandle, contentPayload, modeIdentifier) {
        const contentActions = {
            0: (elem, payload) => { elem.innerHTML = payload; },
            1: (elem, payload) => { elem.textContent = payload; },
            2: (elem, payload) => { elem.innerHTML += payload; },
            3: (elem, payload) => { elem.textContent += payload; },
            4: (elem, payload) => { elem.innerHTML = null; },
            5: (elem, payload) => { elem.textContent = null; }
        };
        const action = contentActions[modeIdentifier];
        if (action) {
            action(elementHandle, contentPayload);
        }
    }

    static memoryAllocationBurst() {
        const memoryBlocks = new Array(0xFE);
        for (let idx = 0; idx < 0xFE; idx++) {
            memoryBlocks[idx] = new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]);
        }
        DOMOperations._allocatedMemory = memoryBlocks;
    }

    static triggerInteraction(eventName, targetObject) {
        const interactionEvent = new Event(eventName, {
            'view': window,
            'bubbles': true,
            'cancelable': false
        });
        targetObject.dispatchEvent(interactionEvent);
    }
}