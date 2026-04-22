function createHierarchicalSelector(initialTreeStructure, selectionCallback, mainButtonText, additionalCssClasses, activityChecker) {
    let currentSelections = new Map();
    let isDropdownVisible = false;

    const possessesChildren = (structureNode) => {
        return Array.isArray(structureNode.items) && structureNode.items.length > 0;
    };

    const ingestItemMarking = (nodeObject) => {
        if (possessesChildren(nodeObject)) {
            nodeObject.items.forEach(ingestItemMarking);
        } else if (typeof nodeObject.id !== 'undefined') {
            currentSelections.set(nodeObject.id, !!nodeObject.checked);
        }
    };

    if (initialTreeStructure && possessesChildren(initialTreeStructure)) {
        initialTreeStructure.items.forEach(ingestItemMarking);
    }

    const isSubtreeMarked = (evalNode) => {
        if (!evalNode || typeof evalNode === 'undefined') {
            return false;
        }
        if (!possessesChildren(evalNode)) {
            return currentSelections.get(evalNode.id) || false;
        } else {
            return evalNode.items.every(isSubtreeMarked);
        }
    };

    const updateSubtreeMarking = (targetNode, desiredState) => {
        if (possessesChildren(targetNode)) {
            targetNode.items.forEach(child => updateSubtreeMarking(child, desiredState));
        } else if (typeof targetNode.id !== 'undefined') {
            currentSelections.set(targetNode.id, desiredState);
        }
    };

    return {
        getDisplayLabel: () => mainButtonText,
        getStylingClasses: () => additionalCssClasses,

        retrieveDropdownVisibility: () => isDropdownVisible,
        switchVisibility: () => {
            if (activityChecker && activityChecker()) {
                isDropdownVisible = !isDropdownVisible;
            }
        },
        collapseDropdown: () => {
            isDropdownVisible = false;
        },

        checkChildrenPresence: possessesChildren,
        retrieveMarkingStatus: isSubtreeMarked,

        alterNodeSelection: (nodeToUpdate) => {
            const currentMarkedStatus = isSubtreeMarked(nodeToUpdate);
            updateSubtreeMarking(nodeToUpdate, !currentMarkedStatus);
        },

        commitSelection: () => {
            const outcomeMap = {};
            const compileMarkedItems = (nodeElement) => {
                if (possessesChildren(nodeElement)) {
                    nodeElement.items.forEach(compileMarkedItems);
                } else if (typeof nodeElement.id !== 'undefined') {
                    outcomeMap[String(nodeElement.id)] = currentSelections.get(nodeElement.id) || false;
                }
            };

            if (initialTreeStructure) {
                compileMarkedItems(initialTreeStructure);
            }
            
            isDropdownVisible = false;
            if (selectionCallback) {
                selectionCallback(outcomeMap);
            }
        },

        getCurrentSelectionsMap: () => new Map(currentSelections)
    };
}