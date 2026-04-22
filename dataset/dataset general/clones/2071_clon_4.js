const obtainImage = (sourcePath) => {
    const imgObj = new Image();
    imgObj.src = sourcePath;
    return imgObj;
};

const createDisplayElement = (startingX, startingY, visualWidth, visualHeight) => {
    let currentX = startingX;
    let currentY = startingY;
    const dimensions = {
        width: visualWidth,
        height: visualHeight
    };

    const elementState = {
        positionX: currentX,
        positionY: currentY,
        visualWidth: dimensions.width,
        visualHeight: dimensions.height,
        isPointerOver: false,
        internalData: {}
    };

    return {
        updateCoordinates: (newX, newY) => {
            elementState.positionX = newX;
            elementState.positionY = newY;
        },

        checkProximity: (pointerX, pointerY) => {
            return (elementState.positionX <= pointerX) &&
                   (elementState.positionY <= pointerY) &&
                   (elementState.positionX + elementState.visualWidth >= pointerX) &&
                   (elementState.positionY + elementState.visualHeight >= pointerY);
        },

        triggerAction: () => { /* Default no-op */ },

        displayVisual: () => { /* Default no-op */ },

        retrieveState: () => ({ ...elementState }),

        setProximityStatus: (status) => {
            elementState.isPointerOver = status;
        },
        
        setInternalDataKey: (key, value) => {
            elementState.internalData[key] = value;
        }
    };
};

const createToggleSizeControl = (startCoordX, startCoordY) => {
    const baseUnit = createDisplayElement(startCoordX, startCoordY, 64, 64);
    let currentModeIsExpanded = false;

    const visualAssets = {
        collapseNormal: obtainImage("img/min.png"),
        collapseActive: obtainImage("img/min-col.png"),
        expandNormal: obtainImage("img/max.png"),
        expandActive: obtainImage("img/max-col.png")
    };

    const determineCurrentAsset = (expandedMode, pointerHover) => {
        const assetKey = (expandedMode ? "collapse" : "expand") + (pointerHover ? "Active" : "Normal");
        return visualAssets[assetKey];
    };

    baseUnit.displayVisual = () => {
        const currentUnitState = baseUnit.retrieveState();
        const currentAsset = determineCurrentAsset(currentModeIsExpanded, currentUnitState.isPointerOver);
        canvasContext.drawImage(currentAsset, currentUnitState.positionX, currentUnitState.positionY);
    };

    baseUnit.triggerAction = () => {
        currentModeIsExpanded = !currentModeIsExpanded;
    };

    baseUnit.getExpansionMode = () => currentModeIsExpanded;

    return baseUnit;
};

const createScriptAcquisitionControl = (startCoordX, startCoordY) => {
    const baseUnit = createDisplayElement(startCoordX, startCoordY, 64, 64);

    const visualAssets = {
        acquireNormal: obtainImage("img/dl.png"),
        acquireActive: obtainImage("img/dl-col.png")
    };

    baseUnit.displayVisual = () => {
        const currentUnitState = baseUnit.retrieveState();
        const currentAsset = currentUnitState.isPointerOver ? visualAssets.acquireActive : visualAssets.acquireNormal;
        
        if (currentUnitState.isPointerOver) {
            canvasContext.fillStyle = appSettings.buttonColor;
            canvasContext.font = "18pt sans-serif";
            canvasContext.fillText("Download pamela scanner script", currentUnitState.positionX, currentUnitState.positionY - 10);
        }
        canvasContext.drawImage(currentAsset, currentUnitState.positionX, currentUnitState.positionY);
    };

    baseUnit.triggerAction = () => {
        window.location.href = appSettings.scannerDownloadLink;
    };

    return baseUnit;
};

const manageInteractiveElements = () => {
    const managedItems = new Map();
    let itemIdentifier = 0;

    const manager = {
        insertElement: (elementInstance) => {
            const key = `item_${itemIdentifier++}`;
            managedItems.set(key, elementInstance);
            manager.arrangeElements();
            return key;
        },

        arrangeElements: () => {
            let horizontalOffset = 20;
            const verticalOffset = viewHeight - 64;

            managedItems.forEach((element) => {
                element.updateCoordinates(horizontalOffset, verticalOffset);
                horizontalOffset += 64;
            });
        },

        renderAllElements: () => {
            managedItems.forEach((element) => element.displayVisual());
        },

        processPointerMovement: (pointerEvent) => {
            managedItems.forEach((element) => {
                const isOver = element.checkProximity(pointerEvent.clientX, pointerEvent.clientY);
                element.setProximityStatus(isOver);
            });
        },

        handlePointerActivation: (pointerEvent) => {
            managedItems.forEach((element) => {
                if (element.checkProximity(pointerEvent.clientX, pointerEvent.clientY)) {
                    element.triggerAction();
                }
            });
        }
    };
    return manager;
};