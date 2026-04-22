const adjustDisplayHeader = (gridContext, structureIdentifier, newText, newTooltipHint) => {
    if (!gridContext.active) {
        return;
    }

    let itemIndex = -1;
    let structureItem = null;

    for (let currentPos = 0; currentPos < gridContext.displayStructure.length; currentPos++) {
        if (gridContext.displayStructure[currentPos].uniqueKey === structureIdentifier) {
            itemIndex = currentPos;
            structureItem = gridContext.displayStructure[currentPos];
            break;
        }
    }

    if (itemIndex === -1) {
        return;
    }

    const headerElementCollection = gridContext.headerContainer.children;
    const targetHeaderElement = headerElementCollection[itemIndex];

    if (targetHeaderElement) {
        if (newText !== undefined) {
            structureItem.labelContent = newText;
        }
        if (newTooltipHint !== undefined) {
            structureItem.hoverInfo = newTooltipHint;
        }

        gridContext.notifier.notify('headerUpdateCommencing', {
            targetNode: targetHeaderElement,
            associatedItem: structureItem
        });

        targetHeaderElement.setAttribute('title', newTooltipHint || '');
        const primaryTextElement = targetHeaderElement.firstElementChild;
        if (primaryTextElement) {
            primaryTextElement.textContent = newText;
        } else {
            targetHeaderElement.textContent = newText;
        }

        gridContext.notifier.notify('headerUpdateFinished', {
            targetNode: targetHeaderElement,
            associatedItem: structureItem
        });
    }
};