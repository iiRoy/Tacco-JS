const KeySerializationUtility = {
    transformToJsonLine: (item) => window.$serial.toJsonL(item),
    parseJsonLine: (data) => window.$serial.fromJsonL(data),
    orderKeyComponents: (keys) => window.$serial.sortKeys(keys),
    commitLayoutToServer: (httpService, layout, successCallback, errorCallback) => window.$serial.saveLayout(httpService, layout, successCallback, errorCallback),
    convertLayoutToSerialForm: (data) => window.$serial.serialize(data),
    reconstructLayoutFromSerialForm: (data) => window.$serial.deserialize(data),
    baseWebPath: window.$serial.base_href
};

const KeyVisualizerHelper = {
    fetchRotationDisplayStyles: (key) => window.$renderKey.getKeyRotationStyles(key),
    produceKeyElementMarkup: (key, sanitizer) => window.$renderKey.html(key, sanitizer)
};

const ColorProcessingAid = {
    generateSRGB8ColorObject: (red, green, blue) => window.$color.sRGB8(red, green, blue)
};

const UrlObjectConverter = {
    decode: (encodedString) => window.URLON.parse(encodedString)
};

const prettifyJsonArray = (dataItems) => {
    const stringifiedEntries = dataItems.map(item => KeySerializationUtility.transformToJsonLine(item));
    return stringifiedEntries.join(",\n") + "\n";
};

const parsePrettyJsonArray = (jsonSource) => {
    return KeySerializationUtility.parseJsonLine('[' + jsonSource + ']');
};

const createCompleteDuplicate = (sourceEntity) => {
    if (sourceEntity === null || typeof sourceEntity !== 'object') {
        return sourceEntity;
    }
    if (sourceEntity instanceof Date) {
        return new Date(sourceEntity.getTime());
    }
    if (Array.isArray(sourceEntity)) {
        return sourceEntity.map(createCompleteDuplicate);
    }
    const duplicatedEntity = {};
    for (const property in sourceEntity) {
        if (Object.prototype.hasOwnProperty.call(sourceEntity, property)) {
            duplicatedEntity[property] = createCompleteDuplicate(sourceEntity[property]);
        }
    }
    return duplicatedEntity;
};

if (!Array.prototype.endItem) {
    Object.defineProperty(Array.prototype, 'endItem', {
        get: function() {
            return this.length ? this[this.length - 1] : undefined;
        },
        enumerable: false,
        configurable: true
    });
}

const StateUpdateNotifier = new EventTarget();
const APPLICATION_STATE_UPDATED = 'applicationStateUpdated';

let applicationGlobalState = {
    currentAppVersion: "0.10",
    activeInterfacePanel: 0,
    currentlySelectedKeys: [],
    collectivePropertyEditor: {},
    keyboardMetadata: {},
    keyboardStructure: { components: [], metadata: {} },
    rawSerializedForm: "",
    formattedSerializedOutput: "",
    availableLayoutPresets: {},
    exampleLayouts: {},
    activeColorPalette: {},
    allColorPalettes: [],
    standardSpecialKeys: {},
    calculatedDisplayHeight: 0,
    pastActionsLog: [],
    futureActionsLog: [],
    coalesceNextAction: false,
    hasUnsavedModifications: false,
    isLayoutPersisted: false,
    persistenceFailureMessage: "",
    layoutLoadingFailure: false,
    serializationParsingIssue: ""
};

const modifyApplicationState = (partialState, updateOptions = {}) => {
    Object.assign(applicationGlobalState, partialState);
    StateUpdateNotifier.dispatchEvent(new CustomEvent(APPLICATION_STATE_UPDATED, { detail: { ...partialState, ...updateOptions } }));
};

const accessKeyboardComponents = (newComponentList) => {
    if (newComponentList) {
        applicationGlobalState.keyboardStructure.components = newComponentList;
    }
    return applicationGlobalState.keyboardStructure.components;
};

const clearAllKeySelections = () => {
    modifyApplicationState({ currentlySelectedKeys: [], collectivePropertyEditor: {} });
};

const selectAllKeyboardComponents = (eventTrigger) => {
    if (eventTrigger) { eventTrigger.preventDefault(); }
    KeySerializationUtility.orderKeyComponents(accessKeyboardComponents());
    clearAllKeySelections();
    accessKeyboardComponents().forEach((componentItem) => {
        applicationGlobalState.currentlySelectedKeys.push(componentItem);
    });
    if (accessKeyboardComponents().length > 0) {
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(accessKeyboardComponents().endItem) });
    }
};

const saveCurrentLayoutToServer = (layoutDataContent) => {
    const mockHttpService = {
        post: (url, data) => new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ data: { filename: "saved_layout_" + Date.now() + ".json" } });
                } else {
                    reject({ status: 500, data: "Service Unavailable" });
                }
            }, 500);
        })
    };

    KeySerializationUtility.commitLayoutToServer(mockHttpService, layoutDataContent,
        (persistedFilename) => {
            modifyApplicationState({
                hasUnsavedModifications: false,
                isLayoutPersisted: persistedFilename,
                persistenceFailureMessage: ""
            });
            window.history.pushState({}, '', `/layouts/${persistedFilename}`);
            if (window.location.hash) {
                window.location.hash = '';
            }
        },
        (errorDetails, errorHttpCode) => {
            modifyApplicationState({
                isLayoutPersisted: false,
                persistenceFailureMessage: `${errorHttpCode.toString()} - ${errorDetails.toString()}`
            });
        }
    );
};

const executeLayoutSave = (triggeringEvent) => {
    if (triggeringEvent) {
        triggeringEvent.preventDefault();
    }
    if (applicationGlobalState.hasUnsavedModifications) {
        saveCurrentLayoutToServer(KeySerializationUtility.convertLayoutToSerialForm(applicationGlobalState.keyboardStructure));
    }
};

const querySaveAbility = () => applicationGlobalState.hasUnsavedModifications;

const processKeyComponentClick = (clickedKey, eventContext) => {
    if (!clickedKey) return;

    let targetComponentIndex;
    let referenceComponentIndex;

    if (eventContext.shiftKey && applicationGlobalState.currentlySelectedKeys.length > 0) {
        const currentSelectionIndices = applicationGlobalState.currentlySelectedKeys.map(k => accessKeyboardComponents().indexOf(k));
        currentSelectionIndices.sort((a, b) => a - b);

        targetComponentIndex = accessKeyboardComponents().indexOf(clickedKey);
        referenceComponentIndex = accessKeyboardComponents().indexOf(applicationGlobalState.currentlySelectedKeys.endItem);

        applicationGlobalState.currentlySelectedKeys.pop();
    }

    if (!eventContext.ctrlKey && !eventContext.altKey) {
        clearAllKeySelections();
    }

    if (referenceComponentIndex !== undefined && targetComponentIndex !== undefined) {
        const startIdx = Math.min(referenceComponentIndex, targetComponentIndex);
        const endIdx = Math.max(referenceComponentIndex, targetComponentIndex);
        for (let i = startIdx; i <= endIdx; ++i) {
            processKeyComponentClick(accessKeyboardComponents()[i], { ctrlKey: true });
        }
        return;
    }

    const existingComponentIndex = applicationGlobalState.currentlySelectedKeys.indexOf(clickedKey);
    if (existingComponentIndex >= 0) {
        applicationGlobalState.currentlySelectedKeys.splice(existingComponentIndex, 1);
        if (applicationGlobalState.currentlySelectedKeys.length < 1) {
            modifyApplicationState({ collectivePropertyEditor: {} });
        } else {
            modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
        }
    } else {
        applicationGlobalState.currentlySelectedKeys.push(clickedKey);
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(clickedKey) });
    }
};

let serializationRefreshTimeoutId = null;

const refreshSerializationDisplay = () => {
    modifyApplicationState({ serializationParsingIssue: "" });
    const rawDataOutput = KeySerializationUtility.convertLayoutToSerialForm(applicationGlobalState.keyboardStructure);
    modifyApplicationState({
        rawSerializedForm: rawDataOutput,
        formattedSerializedOutput: prettifyJsonArray(rawDataOutput)
    });
};

const visualizeSingleKeyComponent = (keyComponent, sanitizerService) => {
    keyComponent.renderedHtmlContent = window.$sce.trustAsHtml(KeyVisualizerHelper.produceKeyElementMarkup(keyComponent, sanitizerService));
};

const deserializeAndRenderLayout = (layoutInputData) => {
    const reconstitutedLayout = KeySerializationUtility.reconstructLayoutFromSerialForm(layoutInputData);
    modifyApplicationState({ keyboardStructure: reconstitutedLayout });
    accessKeyboardComponents().forEach((keyComponent) => {
        visualizeSingleKeyComponent(keyComponent, window.$sanitize);
    });
    modifyApplicationState({ keyboardMetadata: createCompleteDuplicate(applicationGlobalState.keyboardStructure.metadata) });
};

const calculateLayoutBoundingHeight = () => {
    let maximumBottomEdge = 0;
    accessKeyboardComponents().forEach((keyComponent) => {
        maximumBottomEdge = Math.max(maximumBottomEdge, keyComponent.bbox.y2);
    });
    modifyApplicationState({ calculatedDisplayHeight: maximumBottomEdge + 8 });
};

const loadExternalConfiguration = () => {
    fetch('layouts.json')
        .then(response => response.json())
        .then(data => {
            modifyApplicationState({ availableLayoutPresets: data.presets, exampleLayouts: data.samples });
        })
        .catch(error => console.error("Error fetching layouts.json:", error));

    fetch('colors.json')
        .then(response => response.json())
        .then(data => {
            const processedPalettesList = data.map(palette => {
                palette.colors.forEach(colorItem => {
                    colorItem.cssIdentifier = ColorProcessingAid.generateSRGB8ColorObject(colorItem.r, colorItem.g, colorItem.b).hex();
                });
                return palette;
            });
            modifyApplicationState({ allColorPalettes: processedPalettesList });
        })
        .catch(error => console.error("Error fetching colors.json:", error));

    fetch('keys.json')
        .then(response => response.json())
        .then(data => {
            modifyApplicationState({ standardSpecialKeys: data });
        })
        .catch(error => console.error("Error fetching keys.json:", error));
};

const setupInitialLayoutFromUrl = () => {
    deserializeAndRenderLayout([]);
    const currentUrlFragment = window.location.hash.substring(1);
    const currentUrlPath = window.location.pathname;

    if (currentUrlFragment) {
        if (currentUrlFragment.startsWith('@')) {
            deserializeAndRenderLayout(UrlObjectConverter.decode(encodeURI(currentUrlFragment)));
        } else {
            deserializeAndRenderLayout(KeySerializationUtility.parseJsonLine(currentUrlFragment));
        }
    } else if (currentUrlPath !== '/') {
        fetch(KeySerializationUtility.baseWebPath + currentUrlPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP fetch failed with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                deserializeAndRenderLayout(data);
                refreshSerializationDisplay();
            })
            .catch(error => {
                console.error("Failed to load layout from URL path:", error);
                modifyApplicationState({ layoutLoadingFailure: true });
            });
    } else {
        deserializeAndRenderLayout([
            ["Num Lock", "/", "*", "-"],
            ["7\nHome", "8\n↑", "9\nPgUp", { h: 2 }, "+"],
            ["4\n←", "5", "6\n→"],
            ["1\nEnd", "2\n↓", "3\nPgDn", { h: 2 }, "Enter"],
            [{ w: 2 }, "0\nIns", ".\nDel"]
        ]);
    }
    refreshSerializationDisplay();
};

const executeTransactionalOperation = (operationType, operationCallback) => {
    let activeTransaction = applicationGlobalState.pastActionsLog.endItem;
    if (activeTransaction === undefined || !applicationGlobalState.coalesceNextAction || activeTransaction.operationKind !== operationType) {
        activeTransaction = {
            operationKind: operationType,
            initialStateSnapshot: createCompleteDuplicate(applicationGlobalState.keyboardStructure),
            isActive: true,
            previousUnsavedStatus: applicationGlobalState.hasUnsavedModifications
        };
        applicationGlobalState.pastActionsLog.push(activeTransaction);
        if (applicationGlobalState.pastActionsLog.length > 32) {
            applicationGlobalState.pastActionsLog.shift();
        }
    }
    applicationGlobalState.coalesceNextAction = true;
    try {
        operationCallback();
    } finally {
        if (window.location.hash) {
            window.location.hash = "";
        }
        if (window.location.pathname !== '/') {
            window.history.pushState({}, '', '/');
        }
        activeTransaction.finalStateSnapshot = createCompleteDuplicate(applicationGlobalState.keyboardStructure);
        activeTransaction.isActive = false;
        applicationGlobalState.futureActionsLog = [];
        if (operationType !== 'rawdata') {
            refreshSerializationDisplay();
        }
        modifyApplicationState({
            hasUnsavedModifications: true,
            isLayoutPersisted: false,
            persistenceFailureMessage: "",
            layoutLoadingFailure: false
        });
    }
};

const undoLastOperation = () => {
    if (applicationGlobalState.pastActionsLog.length > 0) {
        const performedOperation = applicationGlobalState.pastActionsLog.pop();
        modifyApplicationState({ keyboardStructure: createCompleteDuplicate(performedOperation.initialStateSnapshot) });
        refreshSerializationDisplay();
        accessKeyboardComponents().forEach((keyComponent) => {
            visualizeSingleKeyComponent(keyComponent, window.$sanitize);
        });
        applicationGlobalState.futureActionsLog.push(performedOperation);
        modifyApplicationState({
            hasUnsavedModifications: performedOperation.previousUnsavedStatus,
            currentlySelectedKeys: [],
            collectivePropertyEditor: {},
            keyboardMetadata: createCompleteDuplicate(applicationGlobalState.keyboardStructure.metadata)
        });
    }
};

const redoNextOperation = () => {
    if (applicationGlobalState.futureActionsLog.length > 0) {
        const revertedOperation = applicationGlobalState.futureActionsLog.pop();
        modifyApplicationState({ keyboardStructure: createCompleteDuplicate(revertedOperation.finalStateSnapshot) });
        refreshSerializationDisplay();
        accessKeyboardComponents().forEach((keyComponent) => {
            visualizeSingleKeyComponent(keyComponent, window.$sanitize);
        });
        applicationGlobalState.pastActionsLog.push(revertedOperation);
        modifyApplicationState({
            hasUnsavedModifications: true,
            currentlySelectedKeys: [],
            collectivePropertyEditor: {},
            keyboardMetadata: createCompleteDuplicate(applicationGlobalState.keyboardStructure.metadata)
        });
    }
};

const canRevertOperation = () => applicationGlobalState.pastActionsLog.length > 0;
const canReapplyOperation = () => applicationGlobalState.futureActionsLog.length > 0;

const keyPropertyValidationRules = new Map([
    ['x', (keyEntity, val) => Math.max(0, Math.min(36, val))],
    ['y', (keyEntity, val) => Math.max(0, Math.min(36, val))],
    ['x2', (keyEntity, val) => Math.max(-Math.abs(keyEntity.width - keyEntity.width2), Math.min(Math.abs(keyEntity.width - keyEntity.width2), val))],
    ['y2', (keyEntity, val) => Math.max(-Math.abs(keyEntity.height - keyEntity.height2), Math.min(Math.abs(keyEntity.height - keyEntity.height2), val))],
    ['width', (keyEntity, val) => Math.max(0.5, Math.min(12, val))],
    ['height', (keyEntity, val) => Math.max(0.5, Math.min(12, val))],
    ['width2', (keyEntity, val) => Math.max(0.5, Math.min(12, val))],
    ['height2', (keyEntity, val) => Math.max(0.5, Math.min(12, val))],
    ['fontheight', (keyEntity, val) => Math.max(1, Math.min(9, val))],
    ['fontheight2', (keyEntity, val) => Math.max(1, Math.min(9, val))],
    ['rotation_angle', (keyEntity, val) => Math.max(-180, Math.min(180, val))],
    ['rotation_x', (keyEntity, val) => Math.max(0, Math.min(36, val))],
    ['rotation_y', (keyEntity, val) => Math.max(0, Math.min(36, val))]
]);

const keyPropertyModificationHandlers = new Map([
    ['width', (keyEntity, val) => {
        keyEntity.width = val;
        if (!keyEntity.stepped || keyEntity.width > keyEntity.width2) keyEntity.width2 = val;
    }],
    ['height', (keyEntity, val) => {
        keyEntity.height = val;
        if (!keyEntity.stepped || keyEntity.height > keyEntity.height2) keyEntity.height2 = val;
    }],
    ['centerx', (keyEntity, val) => {
        keyEntity.align = val ? (keyEntity.align | 1) : (keyEntity.align & (~1));
    }],
    ['centery', (keyEntity, val) => {
        keyEntity.align = val ? (keyEntity.align | 2) : (keyEntity.align & (~2));
    }],
    ['centerf', (keyEntity, val) => {
        keyEntity.align = val ? (keyEntity.align | 4) : (keyEntity.align & (~4));
    }],
    ['fontheight', (keyEntity, val) => {
        keyEntity.fontheight = keyEntity.fontheight2 = val;
    }],
    ['stepped', (keyEntity, val) => {
        keyEntity.stepped = val;
        if (val && keyEntity.width === keyEntity.width2) {
            if (keyEntity.width > 1) {
                keyEntity.width = Math.max(1, keyEntity.width - 0.5);
            } else {
                keyEntity.width2 = keyEntity.width + 0.5;
            }
        }
    }],
    ['rotation_angle', (keyEntity, val) => {
        keyEntity.rotation_angle = val;
        keyEntity.rotation_x = applicationGlobalState.collectivePropertyEditor.rotation_x;
        keyEntity.rotation_y = applicationGlobalState.collectivePropertyEditor.rotation_y;
    }]
]);

const validateKeyPropertyAgainstRules = (keyObject, propertyIdentifier, propertyValue) => {
    const validatorFunction = keyPropertyValidationRules.get(propertyIdentifier);
    return validatorFunction ? validatorFunction(keyObject, propertyValue) : propertyValue;
};

const applyKeyPropertyModification = (keyObject, propertyIdentifier, propertyValue) => {
    const modifierFunction = keyPropertyModificationHandlers.get(propertyIdentifier);
    if (modifierFunction) {
        modifierFunction(keyObject, propertyValue);
    } else {
        keyObject[propertyIdentifier] = propertyValue;
    }
};

const updateSelectedKeyProperties = (propertyLabel) => {
    if (applicationGlobalState.collectivePropertyEditor[propertyLabel] === undefined || applicationGlobalState.currentlySelectedKeys.length === 0) {
        return;
    }
    const validatedValueForProperty = validateKeyPropertyAgainstRules(applicationGlobalState.collectivePropertyEditor, propertyLabel, applicationGlobalState.collectivePropertyEditor[propertyLabel]);
    if (validatedValueForProperty !== applicationGlobalState.collectivePropertyEditor[propertyLabel]) {
        return;
    }

    executeTransactionalOperation("propertyModification", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            applyKeyPropertyModification(individualKeyComponent, propertyLabel, applicationGlobalState.collectivePropertyEditor[propertyLabel]);
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
};

const enforcePropertyConstraints = (propertyLabel) => {
    if (applicationGlobalState.collectivePropertyEditor[propertyLabel] === undefined) {
        applicationGlobalState.collectivePropertyEditor[propertyLabel] = "";
    }
    const constrainedValue = validateKeyPropertyAgainstRules(applicationGlobalState.collectivePropertyEditor, propertyLabel, applicationGlobalState.collectivePropertyEditor[propertyLabel]);
    if (constrainedValue !== applicationGlobalState.collectivePropertyEditor[propertyLabel]) {
        applicationGlobalState.collectivePropertyEditor[propertyLabel] = constrainedValue;
        updateSelectedKeyProperties(propertyLabel);
    }
};

const updateKeyboardMetadataProperty = (propertyLabel) => {
    executeTransactionalOperation("metadataModification", () => {
        applicationGlobalState.keyboardStructure.metadata[propertyLabel] = applicationGlobalState.keyboardMetadata[propertyLabel];
    });
};

const validateKeyboardMetadataProperty = (propertyLabel) => {
};

const exchangeKeyColors = () => {
    executeTransactionalOperation("colorExchange", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            const temporaryColorValue = individualKeyComponent.color;
            individualKeyComponent.color = individualKeyComponent.text;
            individualKeyComponent.text = temporaryColorValue;
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
};

const processColorSwatchInteraction = (colorObject, interactionEvent) => {
    interactionEvent.preventDefault();
    if (applicationGlobalState.currentlySelectedKeys.length < 1) {
        return;
    }
    executeTransactionalOperation("colorApplication", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            if (interactionEvent.ctrlKey || interactionEvent.altKey) {
                individualKeyComponent.text = colorObject.cssIdentifier;
            } else {
                individualKeyComponent.color = colorObject.cssIdentifier;
            }
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
};

const adjustKeyComponentPositions = (horizontalShift, verticalShift, interactionEvent) => {
    interactionEvent.preventDefault();
    if (applicationGlobalState.currentlySelectedKeys.length < 1) {
        return;
    }

    if (horizontalShift < 0 || verticalShift < 0) {
        let movementIsPermitted = true;
        for (const selectedComponent of applicationGlobalState.currentlySelectedKeys) {
            if (selectedComponent.x + horizontalShift < 0 ||
                selectedComponent.y + verticalShift < 0 ||
                selectedComponent.x + selectedComponent.x2 + horizontalShift < 0 ||
                selectedComponent.y + selectedComponent.y2 + verticalShift < 0) {
                movementIsPermitted = false;
                break;
            }
        }
        if (!movementIsPermitted) {
            return;
        }
    }

    executeTransactionalOperation("componentMovement", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            individualKeyComponent.x = Math.max(0, individualKeyComponent.x + horizontalShift);
            individualKeyComponent.y = Math.max(0, individualKeyComponent.y + verticalShift);
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
    if (verticalShift !== 0) {
        calculateLayoutBoundingHeight();
    }
};

const resizeKeyComponents = (horizontalChange, verticalChange, interactionEvent) => {
    interactionEvent.preventDefault();
    if (applicationGlobalState.currentlySelectedKeys.length < 1) {
        return;
    }
    executeTransactionalOperation("componentResizing", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            applyKeyPropertyModification(individualKeyComponent, 'width', Math.max(1, individualKeyComponent.width + horizontalChange));
            applyKeyPropertyModification(individualKeyComponent, 'height', Math.max(1, individualKeyComponent.height + verticalChange));
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
    if (verticalChange !== 0) {
        calculateLayoutBoundingHeight();
    }
};

const rotateSelectedKeyComponents = (angleDelta, interactionEvent) => {
    interactionEvent.preventDefault();
    if (applicationGlobalState.currentlySelectedKeys.length < 1) {
        return;
    }
    executeTransactionalOperation("componentRotation", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            let newAngleValue = (individualKeyComponent.rotation_angle + angleDelta + 360) % 360;
            while (newAngleValue > 180) {
                newAngleValue -= 360;
            }
            applyKeyPropertyModification(individualKeyComponent, 'rotation_angle', newAngleValue);
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
    calculateLayoutBoundingHeight();
};

const repositionRotationCenters = (xAdjustment, yAdjustment, interactionEvent) => {
    interactionEvent.preventDefault();
    if (applicationGlobalState.currentlySelectedKeys.length < 1) {
        return;
    }
    executeTransactionalOperation("centerRepositioning", () => {
        applicationGlobalState.currentlySelectedKeys.forEach((individualKeyComponent) => {
            applyKeyPropertyModification(individualKeyComponent, 'rotation_x', validateKeyPropertyAgainstRules(individualKeyComponent, 'rotation_x', applicationGlobalState.collectivePropertyEditor.rotation_x + xAdjustment));
            applyKeyPropertyModification(individualKeyComponent, 'rotation_y', validateKeyPropertyAgainstRules(individualKeyComponent, 'rotation_y', applicationGlobalState.collectivePropertyEditor.rotation_y + yAdjustment));
            visualizeSingleKeyComponent(individualKeyComponent, window.$sanitize);
        });
        modifyApplicationState({ collectivePropertyEditor: createCompleteDuplicate(applicationGlobalState.currentlySelectedKeys.endItem) });
    });
    calculateLayoutBoundingHeight();
};

const activatePaletteSelection = (chosenPalette) => {
    modifyApplicationState({ activeColorPalette: chosenPalette });
};

const retrieveColorNameByIdentifier = (colorHexCode) => {
    if (colorHexCode && applicationGlobalState.activeColorPalette.colors) {
        for (const paletteColor of applicationGlobalState.activeColorPalette.colors) {
            if (paletteColor.cssIdentifier === colorHexCode) {
                return paletteColor.name;
            }
        }
    }
    return "";
};

const loadPredefinedLayout = (presetLayoutData) => {
    executeTransactionalOperation("presetLoading", () => {
        deserializeAndRenderLayout(presetLayoutData);
    });
    modifyApplicationState({ hasUnsavedModifications: false });
};

window.addEventListener('load', () => {
    loadExternalConfiguration();
    setupInitialLayoutFromUrl();

    window.onbeforeunload = (eventObject) => {
        if (applicationGlobalState.hasUnsavedModifications) {
            const confirmationMessage = 'There are unsaved changes to your layout. You can save your layout to the server using the \'Save\' button or locally by bookmarking the \'Permalink\'.';
            eventObject.returnValue = confirmationMessage;
            return confirmationMessage;
        }
        return undefined;
    };

    StateUpdateNotifier.addEventListener(APPLICATION_STATE_UPDATED, (eventDetail) => {
    });
});

window.ApplicationInterface = {
    getApplicationVersion: () => applicationGlobalState.currentAppVersion,
    switchActivePanel: (panelIndex) => modifyApplicationState({ activeInterfacePanel: panelIndex }),
    clearSelectedComponents: clearAllKeySelections,
    selectAllComponents: selectAllKeyboardComponents,
    initiateLayoutSaving: executeLayoutSave,
    canLayoutBeSaved: querySaveAbility,
    handleKeyComponentClick: processKeyComponentClick,
    undoOperation: undoLastOperation,
    redoOperation: redoNextOperation,
    canUndoOperation: canRevertOperation,
    canRedoOperation: canReapplyOperation,
    updateKeyComponentProperty: updateSelectedKeyProperties,
    validateKeyComponentProperty: enforcePropertyConstraints,
    updateKeyboardMetaProperty: updateKeyboardMetadataProperty,
    validateKeyboardMetaProperty: validateKeyboardMetadataProperty,
    swapComponentColors: exchangeKeyColors,
    handleClickColorSwatch: processColorSwatchInteraction,
    moveKeyComponents: adjustKeyComponentPositions,
    resizeKeyComponents: resizeKeyComponents,
    rotateKeyComponents: rotateSelectedKeyComponents,
    moveRotationCenter: repositionRotationCenters,
    activatePalette: activatePaletteSelection,
    retrieveColorLabel: retrieveColorNameByIdentifier,
    loadLayoutPreset: loadPredefinedLayout,
    getKeyboardHeight: () => applicationGlobalState.calculatedDisplayHeight,
    getKeyRotationStyles: KeyVisualizerHelper.fetchRotationDisplayStyles,
    getAllKeyboardComponents: accessKeyboardComponents
};