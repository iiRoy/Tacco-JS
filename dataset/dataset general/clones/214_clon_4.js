const DataMatrix = {};

DataMatrix.release = "1.0.0";
DataMatrix.minimumFramework = { main: 1, sub: 4, patch: 0 };

DataMatrix.ChoiceMechanism = Object.freeze({
    NONE: Symbol('NONE'),
    SINGLE_RECORD: Symbol('SINGLE_RECORD'),
    MULTIPLE_RECORDS: Symbol('MULTIPLE_RECORDS'),
    MODIFIER_MULTIPLE_RECORDS: Symbol('MODIFIER_MULTIPLE_RECORDS')
});

DataMatrix.standardColumnConfigTemplate = {
    contentWidth: null,
    contentHeight: null,
    contentAlignment: null,
    contentFormatter: null,
    displayLabel: null,
    dataFilter: null,
    allowFiltering: null,
    allowSorting: null
};

DataMatrix.initialColumnConfiguration = {};
DataMatrix.localizationStrings = {};
DataMatrix.developmentMode = false;

let layoutInitializationStatus = false;

const componentNamespace = "dtmx";
const sortProcessIdentifier = componentNamespace + "SortProcess";
const dataPagingProcessIdentifier = componentNamespace + "DataPagingProcess";
const translationProcessIdentifier = componentNamespace + "TranslationProcess";
const dateFormattingIdentifier = componentNamespace + "DateFormat";
const dataFormattingProcessIdentifier = componentNamespace + "DataFormatProcess";

const contentBodyAttribute = "data-" + componentNamespace + "-body";
const contentKeyAttribute = "data-item-key";
const alternateContentKeyAttribute = "data-alt-item-key";
const customizedContentAttribute = "data-bespoke";

const footerCellAttribute = "data-" + componentNamespace + "-footer-cell";
const footerCellLayoutId = componentNamespace + "FooterCell.html";

const globalFilterAttribute = "data-" + componentNamespace + "-global-filter";
const globalFilterLayoutId = componentNamespace + "GlobalFilter.html";

const pagerAttribute = "data-" + componentNamespace + "-pager";
const pagerLayoutId = componentNamespace + "Pager.html";

const headerCellAttribute = "data-" + componentNamespace + "-header-cell";
const headerCellLayoutId = componentNamespace + "HeaderCell.html";

const dataCellAttribute = "data-" + componentNamespace + "-data-cell";
const dataCellLayoutId = componentNamespace + "DataCell.html";

const columnSorterAttribute = "data-" + componentNamespace + "-column-sort";
const columnSorterLayoutId = componentNamespace + "ColumnSort.html";

const columnFilterAttribute = "data-" + componentNamespace + "-column-filter";
const columnFilterLayoutId = componentNamespace + "ColumnFilter.html";

const findDirectChildByTag = (parentElem, childTag) => {
    childTag = childTag.toUpperCase();
    for (const child of parentElem.children) {
        if (child.tagName === childTag) {
            return child;
        }
    }
    return null;
};

const findDirectChildrenByTag = (parentElem, childTag) => {
    childTag = childTag.toUpperCase();
    const foundChildren = [];
    for (const child of parentElem.children) {
        if (child.tagName === childTag) {
            foundChildren.push(child);
        }
    }
    return foundChildren;
};

const combineDescriptorSets = (primaryList, secondaryList, includeExtraPrimaryKeys, includeExtraSecondaryKeys) => {
    const finalSet = [];
    const tempSecondaryList = [...secondaryList];

    primaryList.forEach(primaryItem => {
        let matchedSecondaryItem = null;
        for (let j = 0; j < tempSecondaryList.length; j++) {
            const currentSecondaryItem = tempSecondaryList[j];
            if (currentSecondaryItem.keyName === primaryItem.keyName) {
                matchedSecondaryItem = currentSecondaryItem;
                tempSecondaryList.splice(j, 1);
                break;
            }
        }
        finalSet.push(matchedSecondaryItem || primaryItem);
    });

    if (includeExtraPrimaryKeys || includeExtraSecondaryKeys) {
        tempSecondaryList.forEach(secondaryItem => {
            if ((includeExtraPrimaryKeys && secondaryItem.keyName) || (includeExtraSecondaryKeys && !secondaryItem.keyName)) {
                finalSet.push(secondaryItem);
            }
        });
    }
    return finalSet;
};

const encloseTemplateContent = (templateElement, isCustomized, cellTemplateIdentifier) => {
    if (isCustomized) {
        const innerContent = [...templateElement.children];
        const firstChild = innerContent[0];
        if (innerContent.length !== 1 || !firstChild || !firstChild.hasAttribute(cellTemplateIdentifier)) {
            templateElement.innerHTML = '';
            const wrapperElement = document.createElement("div");
            wrapperElement.setAttribute(cellTemplateIdentifier, "");
            innerContent.forEach(child => wrapperElement.appendChild(child));
            templateElement.appendChild(wrapperElement);
        }
    } else {
        templateElement.innerHTML = '';
        const defaultWrapper = document.createElement("div");
        defaultWrapper.setAttribute(cellTemplateIdentifier, "");
        templateElement.appendChild(defaultWrapper);
    }
};

class LayoutCellDescriptor {
    constructor(hostSegment, cellElement) {
        this.hostSegment = hostSegment;
        this.cellElement = cellElement;
        this.keyName = cellElement.getAttribute(contentKeyAttribute) || cellElement.getAttribute(alternateContentKeyAttribute);
        this.isDefaultContent = cellElement.children.length === 0;
    }
}

class LayoutSegmentProcessor {
    constructor(segmentTag, segmentAttr, rowAttr, cellTag, cellAttr) {
        this.segmentTagName = segmentTag.toUpperCase();
        this.segmentAttribute = segmentAttr;
        this.rowAttribute = rowAttr;
        this.cellTagName = cellTag.toUpperCase();
        this.cellAttribute = cellAttr;
        this.cellDescriptors = null;
        this.cachedRowElement = null;
    }

    composeSegment(matrixContainer, columnConfigurations) {
        const targetSegment = this.getSegmentElement(matrixContainer, true);
        targetSegment.innerHTML = '';
        targetSegment.removeAttribute("ng-non-bindable");

        const rowContentDefinitions = combineDescriptorSets(columnConfigurations, this.cellDescriptors, false, false);

        const templateRowElem = this.getTemplatedRowElement(targetSegment, true);
        
        rowContentDefinitions.forEach((cellDefinition, idx) => {
            let cellElement;
            const currentLayoutCell = cellDefinition;

            if (currentLayoutCell instanceof LayoutCellDescriptor && currentLayoutCell.hostSegment === this && currentLayoutCell.cellElement) {
                cellElement = currentLayoutCell.cellElement.cloneNode(true);
            } else {
                cellElement = document.createElement(this.cellTagName);
            }

            if (this.cellAttribute) {
                cellElement.setAttribute(this.cellAttribute, idx.toString());
            }
            if (!cellDefinition.isDefaultContent) {
                cellElement.setAttribute(customizedContentAttribute, "true");
            }
            if (cellDefinition.keyName) {
                cellElement.setAttribute(contentKeyAttribute, cellDefinition.keyName);
            }
            cellElement.setAttribute("style", "width: var(--column-width); height: var(--column-height);");

            templateRowElem.appendChild(cellElement);
        });

        return targetSegment;
    }

    retrieveColumnLayouts() {
        return this.cellDescriptors;
    }

    analyzeLayoutTemplates(matrixContainer) {
        this.cellDescriptors = [];
        this.cachedRowElement = null;
        const potentialRow = this.getTemplatedRowElement(this.getSegmentElement(matrixContainer, false), false);

        if (potentialRow) {
            this.cachedRowElement = potentialRow.cloneNode(true);
            this.cachedRowElement.innerHTML = '';
            for (const child of potentialRow.children) {
                if (child.tagName === this.cellTagName) {
                    this.cellDescriptors.push(new LayoutCellDescriptor(this, child.cloneNode(true)));
                }
            }
        }
    }

    getSegmentElement(matrixContainer, ensureExistence) {
        let segmentElement = null;
        if (matrixContainer) {
            segmentElement = findDirectChildByTag(matrixContainer, this.segmentTagName);
        }

        if (!segmentElement && ensureExistence) {
            segmentElement = document.createElement(this.segmentTagName);
            if (matrixContainer) {
                matrixContainer.appendChild(segmentElement);
            }
        }

        if (segmentElement && ensureExistence && this.segmentAttribute) {
            segmentElement.setAttribute(this.segmentAttribute, "");
        }
        return segmentElement;
    }

    getTemplatedRowElement(segmentElement, ensureExistence) {
        let rowElement = null;
        if (segmentElement) {
            rowElement = findDirectChildByTag(segmentElement, "tr");
        }

        if (!rowElement && ensureExistence) {
            rowElement = this.cachedRowElement ? this.cachedRowElement.cloneNode(true) : document.createElement("tr");
            if (segmentElement) {
                segmentElement.appendChild(rowElement);
            }
        }

        if (rowElement && ensureExistence && this.rowAttribute) {
            rowElement.setAttribute(this.rowAttribute, "");
        }
        return rowElement;
    }
}

class ConfigurationNotifier {
    constructor() {
        this.observers = new Map();
        this.nextObserverId = 0;
    }

    register(callback) {
        const id = this.nextObserverId++;
        this.observers.set(id, callback);
        return () => this.deregister(id);
    }

    deregister(id) {
        this.observers.delete(id);
    }

    signal(propertyKey, newValue, oldValue) {
        this.observers.forEach(callback => callback(propertyKey, newValue, oldValue));
    }
}

class MatrixOverseer {
    constructor(domServiceRef, expressionEvaluatorRef, timerServiceRef, templateStorageRef) {
        this.domService = domServiceRef;
        this.expressionEvaluator = expressionEvaluatorRef;
        this.timerService = timerServiceRef;
        this.templateStorage = templateStorageRef;

        this.currentMatrixConfiguration = null;
        this.dataRetrievalHandle = null;
        this.isServerManaged = false;
        this.configNotifier = new ConfigurationNotifier();

        if (!layoutInitializationStatus) {
            this.prepareComponentLayouts(this.templateStorage);
            layoutInitializationStatus = true;
        }
    }

    prepareComponentLayouts(templateStorage) {
        templateStorage.set(headerCellLayoutId, "<span class='dtmx-sort-label' data-dtmx-column-sort></span>");
        templateStorage.set(dataCellLayoutId, "<span class='dtmx-data-content'>{{item[columnOptions.fieldName]}}</span>");
        templateStorage.set(footerCellLayoutId, "<span class='dtmx-footer-content'></span>");
        templateStorage.set(globalFilterLayoutId, "<input type='text' placeholder='Global filter...' data-dtmx-global-filter-input>");
        templateStorage.set(pagerLayoutId, "<div class='dtmx-pager-controls'></div>");
        templateStorage.set(columnSorterLayoutId, "<span class='dtmx-sort-indicator'></span>");
        templateStorage.set(columnFilterLayoutId, "<input type='text' placeholder='Filter...' data-dtmx-column-filter-input>");
    }

    initializeMatrixConfiguration(matrixConfiguration, serverManagedMode) {
        this.currentMatrixConfiguration = matrixConfiguration;
        this.isServerManaged = serverManagedMode;

        matrixConfiguration.columnDefinitions = matrixConfiguration.columnDefinitions || [];
        matrixConfiguration.localeIdentifier = matrixConfiguration.localeIdentifier || "en";
        matrixConfiguration.recordChoiceMode = matrixConfiguration.recordChoiceMode || DataMatrix.ChoiceMechanism.MULTIPLE_RECORDS;
        matrixConfiguration.fieldFilters = matrixConfiguration.fieldFilters || {};
        matrixConfiguration.enableFieldFiltering = matrixConfiguration.enableFieldFiltering !== false;
        matrixConfiguration.enableColumnSorting = matrixConfiguration.enableColumnSorting !== false;
        matrixConfiguration.dataFetchThrottle = matrixConfiguration.dataFetchThrottle === undefined ? 1000 : matrixConfiguration.dataFetchThrottle;
        matrixConfiguration.chosenRecords = matrixConfiguration.chosenRecords || [];
        matrixConfiguration.currentPanel = matrixConfiguration.currentPanel || 0;

        const monitoredKeys = [
            'currentPanel', 'globalFilterTerm', 'fieldFilters', 'sortCriterion',
            'sortDescending', 'panelItemCount'
        ];

        if (this.isServerManaged) {
            const executeDataRequest = () => {
                this.dataRetrievalHandle = null;
                this.currentMatrixConfiguration.instantDataFetch = false;
                DataMatrix.developmentMode && console.log("Requesting data - server-managed mode");
                this.currentMatrixConfiguration.dataSupplyCallback(this.currentMatrixConfiguration);
            };

            const scheduleDataFetch = () => {
                if (this.dataRetrievalHandle) {
                    this.timerService.clear(this.dataRetrievalHandle);
                    this.dataRetrievalHandle = null;
                }
                if (this.currentMatrixConfiguration.instantDataFetch) {
                    executeDataRequest();
                } else {
                    this.dataRetrievalHandle = this.timerService.set(() => {
                        executeDataRequest();
                    }, this.currentMatrixConfiguration.dataFetchThrottle);
                }
            };
            
            this.configNotifier.register((key, newValue, oldValue) => {
                if (key === 'instantDataFetch' && newValue === true && this.dataRetrievalHandle) {
                    this.timerService.clear(this.dataRetrievalHandle);
                    executeDataRequest();
                } else if (monitoredKeys.includes(key) && newValue !== oldValue) {
                    if (key !== 'currentPanel' && this.currentMatrixConfiguration.currentPanel !== 0) {
                        this.currentMatrixConfiguration.currentPanel = 0;
                    }
                    scheduleDataFetch();
                }
            });
            scheduleDataFetch();
        }

        this.configNotifier.register((key, newValue, oldValue) => {
            if (key === 'recordChoiceMode' && newValue !== oldValue) {
                switch (newValue) {
                    case DataMatrix.ChoiceMechanism.NONE:
                        this.currentMatrixConfiguration.chosenRecords.splice(0);
                        break;
                    case DataMatrix.ChoiceMechanism.SINGLE_RECORD:
                        if (this.currentMatrixConfiguration.chosenRecords.length > 1) {
                            this.currentMatrixConfiguration.chosenRecords.splice(1);
                        }
                        break;
                }
            }
        });

        this.currentMatrixConfiguration = new Proxy(matrixConfiguration, {
            set: (target, property, value) => {
                const oldValue = target[property];
                target[property] = value;
                if (oldValue !== value) {
                    this.configNotifier.signal(property, value, oldValue);
                }
                return true;
            }
        });

        return this.currentMatrixConfiguration;
    }

    expediteDataRequest(eventDetails) {
        if (!eventDetails || eventDetails.key === 'Enter') {
            this.currentMatrixConfiguration.instantDataFetch = true;
        }
    }

    establishColumnConfiguration(columnIndex, newOptions) {
        let existingOptions = this.currentMatrixConfiguration.columnDefinitions[columnIndex];
        if (!existingOptions) {
            throw new Error(`Invalid column index ${columnIndex}. Configuration not found.`);
        }
        Object.assign(existingOptions, newOptions);
        this.currentMatrixConfiguration.columnDefinitions[columnIndex] = existingOptions;
    }

    alterSortOrder(propertyKey) {
        if (this.currentMatrixConfiguration.sortCriterion !== propertyKey) {
            this.currentMatrixConfiguration.sortCriterion = propertyKey;
            this.currentMatrixConfiguration.sortDescending = false;
        } else {
            this.currentMatrixConfiguration.sortDescending = !this.currentMatrixConfiguration.sortDescending;
        }
        this.expediteDataRequest();
    }

    manageRecordChoice(displayedWrappers, recordPayload, eventDetails) {
        if (this.currentMatrixConfiguration.recordChoiceMode === DataMatrix.ChoiceMechanism.NONE) {
            return;
        }

        const currentChosen = this.currentMatrixConfiguration.chosenRecords;
        const payloadIndexInChosen = currentChosen.indexOf(recordPayload);

        switch (this.currentMatrixConfiguration.recordChoiceMode) {
            case DataMatrix.ChoiceMechanism.MODIFIER_MULTIPLE_RECORDS:
                if (!eventDetails.ctrlKey && !eventDetails.shiftKey && !eventDetails.metaKey) {
                    currentChosen.splice(0);
                    if (payloadIndexInChosen < 0) {
                        currentChosen.push(recordPayload);
                    }
                } else {
                    if (eventDetails.ctrlKey || eventDetails.metaKey) {
                        if (payloadIndexInChosen >= 0) {
                            currentChosen.splice(payloadIndexInChosen, 1);
                        } else {
                            currentChosen.push(recordPayload);
                        }
                    } else if (eventDetails.shiftKey) {
                        if (window.getSelection) {
                            window.getSelection().removeAllRanges();
                        } else if (document.selection && document.selection.empty) {
                            document.selection.empty();
                        }

                        let lastChosenPayload = currentChosen[currentChosen.length - 1];
                        let startIndex = 0;
                        for (let i = 0; i < displayedWrappers.length; i++) {
                            if (displayedWrappers[i]._payload === lastChosenPayload) {
                                startIndex = i;
                                break;
                            }
                        }

                        let endIndex = 0;
                        for (let i = 0; i < displayedWrappers.length; i++) {
                            if (displayedWrappers[i]._payload === recordPayload) {
                                endIndex = i;
                                break;
                            }
                        }

                        if (endIndex < startIndex) {
                            [startIndex, endIndex] = [endIndex, startIndex];
                        }

                        for (let i = startIndex; i <= endIndex; i++) {
                            const currentPayload = displayedWrappers[i]._payload;
                            if (currentChosen.indexOf(currentPayload) < 0) {
                                currentChosen.push(currentPayload);
                            }
                        }
                    }
                }
                break;
            case DataMatrix.ChoiceMechanism.SINGLE_RECORD:
                currentChosen.splice(0);
                if (payloadIndexInChosen < 0) {
                    currentChosen.push(recordPayload);
                }
                break;
            case DataMatrix.ChoiceMechanism.MULTIPLE_RECORDS:
                if (payloadIndexInChosen >= 0) {
                    currentChosen.splice(payloadIndexInChosen, 1);
                } else {
                    currentChosen.push(recordPayload);
                }
                break;
        }
    }

    extractLayoutDefinitions(matrixContainerElement) {
        this.headerLayoutProcessor = new LayoutSegmentProcessor("thead", null, null, "th", headerCellAttribute);
        this.bodyLayoutProcessor = new LayoutSegmentProcessor("tbody", contentBodyAttribute, null, "td", dataCellAttribute);
        this.footerLayoutProcessor = new LayoutSegmentProcessor("tfoot", null, null, "td", footerCellAttribute);

        this.headerLayoutProcessor.analyzeLayoutTemplates(matrixContainerElement);
        this.footerLayoutProcessor.analyzeLayoutTemplates(matrixContainerElement);
        this.bodyLayoutProcessor.analyzeLayoutTemplates(matrixContainerElement);
    }

    sanitizeKeyName(keyName) {
        return keyName.replace(/[^a-zA-Z0-9]/g, "_");
    }

    constructGridDisplay(parentContext, gridDisplayElement, previousContext) {
        try {
            gridDisplayElement.innerHTML = '';
            if (previousContext) {
                this.timerService.set(() => {
                    // previousContext.releaseResources();
                }, 0);
                previousContext = null;
            }

            const currentContext = {
                // This would hold data/methods accessible to child components
            };

            this.headerLayoutProcessor.composeSegment(gridDisplayElement, this.currentMatrixConfiguration.columnDefinitions);
            this.bodyLayoutProcessor.composeSegment(gridDisplayElement, this.currentMatrixConfiguration.columnDefinitions);
            this.footerLayoutProcessor.composeSegment(gridDisplayElement, this.currentMatrixConfiguration.columnDefinitions);

        } catch (error) {
            console.error("Error during grid display construction:", error);
        }
    }
}

const domService = {
    createElement: (tag) => document.createElement(tag),
    appendChild: (parent, child) => parent.appendChild(child),
    clearChildren: (element) => element.innerHTML = '',
};

const expressionEvaluator = {
    evaluate: (expression, context) => {
        return (data) => {
            try {
                const combinedContext = { ...context, ...data };
                const func = new Function('ctx', `with(ctx) { return ${expression}; }`);
                return func(combinedContext);
            } catch (e) {
                console.warn(`Error evaluating expression: ${expression}`, e);
                return undefined;
            }
        };
    }
};

const timerService = {
    set: (callback, delay) => setTimeout(callback, delay),
    clear: (timerId) => clearTimeout(timerId)
};

const templateStorage = new Map();