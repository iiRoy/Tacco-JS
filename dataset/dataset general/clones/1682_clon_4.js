class UIElement {
    constructor(elementConfig = {}) {
        this.rootElement = document.createElement(elementConfig.tag || 'div');
        if (elementConfig.baseClass) {
            this.rootElement.className = elementConfig.baseClass;
        }
        if (elementConfig.initialContent) {
            this.rootElement.innerHTML = elementConfig.initialContent;
        }
        if (elementConfig.styleProperties) {
            Object.assign(this.rootElement.style, elementConfig.styleProperties);
        }
        this.eventHandlers = {};

        if (elementConfig.eventCallbacks) {
            for (const eventName in elementConfig.eventCallbacks) {
                this.registerEventHandler(eventName, elementConfig.eventCallbacks[eventName]);
            }
        }
    }

    appendTo(parentContainer) {
        parentContainer.appendChild(this.rootElement);
    }

    getVisualElement() {
        return this.rootElement;
    }

    registerEventHandler(eventType, callbackFunction) {
        if (!this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = [];
        }
        const boundCallback = callbackFunction.bind(this);
        this.rootElement.addEventListener(eventType, boundCallback);
        this.eventHandlers[eventType].push({ original: callbackFunction, bound: boundCallback });
    }

    unregisterEventHandler(eventType, callbackFunction) {
        if (this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(h => {
                if (h.original === callbackFunction) {
                    this.rootElement.removeEventListener(eventType, h.bound);
                    return false;
                }
                return true;
            });
        }
    }

    dispatchCustomEvent(eventName, eventPayload = {}) {
        const customEvent = new CustomEvent(eventName, { detail: eventPayload });
        this.rootElement.dispatchEvent(customEvent);
    }

    findDescendants(selector) {
        return Array.from(this.rootElement.querySelectorAll(selector));
    }

    findFirstDescendant(selector) {
        return this.rootElement.querySelector(selector);
    }

    addVisualClass(className) {
        this.rootElement.classList.add(className);
    }

    removeVisualClass(className) {
        this.rootElement.classList.remove(className);
    }

    hasVisualClass(className) {
        return this.rootElement.classList.contains(className);
    }

    setVisualDimension(property, value) {
        if (property === 'width' || property === 'height') {
            this.rootElement.style[property] = typeof value === 'number' ? `${value}px` : value;
        }
    }
}

class DataCollection {
    constructor(initialEntries = []) {
        this.entries = initialEntries.map(entry => ({ ...entry, changed: false, initialValues: { ...entry } }));
        this.subscribers = {
            'dataModified': [],
            'collectionChanged': []
        };
        this.currentSortConfig = {};
    }

    addEntry(entry) {
        this.entries.push({ ...entry, changed: false, initialValues: { ...entry } });
        this.notifySubscribers('collectionChanged', { action: 'add', entry });
    }

    modifyEntry(entryIndex, newFieldValues) {
        if (entryIndex < 0 || entryIndex >= this.entries.length) return;
        const entry = this.entries[entryIndex];
        const oldFieldValues = { ...entry };
        let wasChanged = false;
        for (const key in newFieldValues) {
            if (entry[key] !== newFieldValues[key]) {
                entry[key] = newFieldValues[key];
                entry.changed = true;
                wasChanged = true;
            }
        }
        if (wasChanged) {
            this.notifySubscribers('dataModified', { entryRecord: entry, previous: oldFieldValues, operation: 'update' });
        }
    }

    subscribe(eventName, handler) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].push(handler);
        }
    }

    unsubscribe(eventName, handler) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName] = this.subscribers[eventName].filter(h => h !== handler);
        }
    }

    notifySubscribers(eventName, data) {
        if (this.subscribers[eventName]) {
            this.subscribers[eventName].forEach(handler => handler(this, data.entryRecord, data.operation || data.action));
        }
    }

    getAllEntries() {
        return this.entries;
    }

    getEntryIndex(targetEntry) {
        return this.entries.indexOf(targetEntry);
    }

    sortEntries(fieldKey) {
        const currentDirection = this.currentSortConfig[fieldKey] || 'ASC';
        const newDirection = currentDirection === 'ASC' ? 'DESC' : 'ASC';

        this.entries.sort((a, b) => {
            const valueA = a[fieldKey];
            const valueB = b[fieldKey];

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return newDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return newDirection === 'ASC' ? valueA - valueB : valueB - valueA;
        });

        this.currentSortConfig = { [fieldKey]: newDirection };
        this.notifySubscribers('collectionChanged', { action: 'sort' });
    }

    getSortDirection(fieldKey) {
        return this.currentSortConfig[fieldKey];
    }
}

class GridHeaderDisplay extends UIElement {
    constructor(parentGridController, headerLayout) {
        super({ baseClass: 'grid-header-wrapper' });
        this.parentController = parentGridController;
        this.columnStructure = headerLayout.columns;
        this.buildHeaderContent();
        this.registerEventHandler('click', this.handleHeaderInteraction);
    }

    buildHeaderContent() {
        const headerTableElement = document.createElement('table');
        headerTableElement.className = 'grid-header-table';
        headerTableElement.style.width = '100%';
        const headerRowElement = headerTableElement.insertRow();
        headerRowElement.className = 'grid-header-row';

        this.columnStructure.forEach(colInfo => {
            if (typeof colInfo.headerLabel !== 'string') return;

            const cellElement = headerRowElement.insertCell();
            cellElement.className = `grid-header-item grid-item-for-${colInfo.dataProperty}`;
            cellElement.setAttribute('data-property', colInfo.dataProperty);
            cellElement.textContent = colInfo.headerLabel;

            if (colInfo.concealed) {
                cellElement.classList.add('grid-item-hidden');
            }
        });
        this.rootElement.appendChild(headerTableElement);
    }

    handleHeaderInteraction(eventObject) {
        eventObject.preventDefault();
        const clickedHeaderItem = eventObject.target.closest('.grid-header-item');
        if (clickedHeaderItem) {
            const propertyId = clickedHeaderItem.getAttribute('data-property');
            if (typeof propertyId === 'string') {
                this.parentController.retrieveDataStore().sortEntries(propertyId);

                this.findDescendants('.grid-header-item').forEach(item => {
                    item.removeAttribute('data-sort-indicator');
                });
                const sortState = this.parentController.retrieveDataStore().getSortDirection(propertyId);
                if (sortState) {
                    clickedHeaderItem.setAttribute('data-sort-indicator', sortState.toLowerCase());
                }
            }
        }
    }

    refreshColumnVisibility(propertyId, isConcealed) {
        this.findDescendants(`.grid-item-for-${propertyId}`).forEach(item => {
            if (isConcealed) {
                item.classList.add('grid-item-hidden');
            } else {
                item.classList.remove('grid-item-hidden');
            }
        });
    }
}

class GridBodyDisplay extends UIElement {
    constructor(parentGridController, colDefinitions, dataProvider, allowMultiSelect, scrollBehavior) {
        super({ baseClass: 'grid-body-pane', styleProperties: { overflowY: scrollBehavior === 'vertical' ? 'auto' : 'hidden' } });
        this.parentController = parentGridController;
        this.columnDefinitions = colDefinitions;
        this.dataProvider = dataProvider;
        this.enableMultiSelection = allowMultiSelect;

        this.dataDisplayTable = document.createElement('table');
        this.dataDisplayTable.className = 'grid-data-structure';
        this.dataDisplayTable.style.width = '100%';
        this.rootElement.appendChild(this.dataDisplayTable);

        this.registerEventHandler('click', this.processBodyClick);
        this.registerEventHandler('dblclick', this.processBodyDoubleClick);
    }

    assignNewDataProvider(newProvider) {
        this.dataProvider = newProvider;
    }

    processBodyClick(eventObject) {
        const clickedDataItem = eventObject.target.closest('.grid-data-row');
        if (clickedDataItem) {
            const itemIndex = parseInt(clickedDataItem.getAttribute('data-index'), 10);
            this.parentController.dispatchCustomEvent('entryChosen', {
                itemIndex: itemIndex,
                itemRecord: this.dataProvider.getAllEntries()[itemIndex],
                sourceEvent: eventObject
            });
            if (!this.enableMultiSelection) {
                this.findDescendants('.grid-data-row.grid-row-active').forEach(row => {
                    row.classList.remove('grid-row-active');
                });
                clickedDataItem.classList.add('grid-row-active');
            }
        }
    }

    processBodyDoubleClick(eventObject) {
        const clickedDataItem = eventObject.target.closest('.grid-data-row');
        if (clickedDataItem) {
            const itemIndex = parseInt(clickedDataItem.getAttribute('data-index'), 10);
            this.parentController.dispatchCustomEvent('entryDoubleTapped', {
                itemIndex: itemIndex,
                itemRecord: this.dataProvider.getAllEntries()[itemIndex],
                sourceEvent: eventObject
            });
        }
    }

    prepareEntryForRendering(entryRecord, entryIndex) {
        const preparedFields = {};
        for (const colDef of this.columnDefinitions) {
            const originalValue = entryRecord[colDef.dataProperty];
            if (typeof colDef.visualRenderer === 'function') {
                preparedFields[colDef.dataProperty] = colDef.visualRenderer.apply(this.parentController, [originalValue, colDef, entryRecord, entryIndex]);
            } else {
                preparedFields[colDef.dataProperty] = originalValue;
            }
        }
        preparedFields.isEntryModified = entryRecord.changed;
        preparedFields.entrySequence = entryIndex;
        return preparedFields;
    }

    drawAllRows() {
        this.dataDisplayTable.innerHTML = '';

        const allRecords = this.dataProvider.getAllEntries();
        allRecords.forEach((record, index) => {
            const processedData = this.prepareEntryForRendering(record, index);
            const rowElement = this.generateRowElement(processedData, record);
            this.dataDisplayTable.appendChild(rowElement);
        });
        this.parentController.updateAllColumnDimensions();
    }

    generateRowElement(processedData, rawRecord) {
        const rowDiv = this.dataDisplayTable.insertRow();
        rowDiv.className = 'grid-data-row';
        if (processedData.isEntryModified) {
            rowDiv.classList.add('grid-row-changed');
        }
        rowDiv.setAttribute('data-index', processedData.entrySequence);

        this.columnDefinitions.forEach(colDef => {
            const cellDiv = rowDiv.insertCell();
            cellDiv.className = `grid-data-cell grid-cell-for-${colDef.dataProperty}`;
            cellDiv.setAttribute('data-property', colDef.dataProperty);
            cellDiv.setAttribute('data-record-position', processedData.entrySequence);

            if (colDef.concealed) {
                cellDiv.classList.add('grid-item-hidden');
            }

            if (rawRecord.changed && rawRecord.initialValues[colDef.dataProperty] !== rawRecord[colDef.dataProperty]) {
                cellDiv.classList.add('grid-cell-changed');
            }

            cellDiv.innerHTML = processedData[colDef.dataProperty];

            if (colDef.cellStyles) {
                Object.assign(cellDiv.style, colDef.cellStyles);
            }
            if (colDef.cellClasses) {
                cellDiv.classList.add(colDef.cellClasses);
            }
        });
        return rowDiv;
    }

    refreshSpecificRow(recordToUpdate) {
        const recordIdx = this.dataProvider.getEntryIndex(recordToUpdate);
        if (recordIdx === -1) return;

        const existingRowElem = this.dataDisplayTable.querySelector(`.grid-data-row[data-index="${recordIdx}"]`);
        if (existingRowElem) {
            const preparedData = this.prepareEntryForRendering(recordToUpdate, recordIdx);
            const newRowElem = this.generateRowElement(preparedData, recordToUpdate);
            existingRowElem.replaceWith(newRowElem);
            this.parentController.updateAllColumnDimensions();
        }
    }

    refreshColumnVisibility(propertyId, isConcealed) {
        this.findDescendants(`.grid-cell-for-${propertyId}`).forEach(cell => {
            if (isConcealed) {
                cell.classList.add('grid-item-hidden');
            } else {
                cell.classList.remove('grid-item-hidden');
            }
        });
    }
}

class DataGridController extends UIElement {
    constructor(configuration) {
        super({ baseClass: 'data-grid-container' });

        this.columnDefinitions = configuration.columnLayout || [];
        this.dataStore = configuration.dataSource;
        this.multipleSelectionAllowed = configuration.enableMultiSelect || false;
        this.scrollMode = configuration.scrollBehavior || 'vertical';

        this.headerDisplay = null;
        this.bodyDisplay = null;

        this.initializeGridElements();
    }

    initializeGridElements() {
        const headerMetadata = this.computeHeaderMetadata();
        this.headerDisplay = new GridHeaderDisplay(this, headerMetadata);
        this.headerDisplay.appendTo(this.rootElement);

        this.bodyDisplay = new GridBodyDisplay(this, this.columnDefinitions, this.dataStore, this.multipleSelectionAllowed, this.scrollMode);
        this.bodyDisplay.appendTo(this.rootElement);

        if (this.dataStore) {
            this.dataStore.subscribe('dataModified', this.onDataEntryModified.bind(this));
            this.dataStore.subscribe('collectionChanged', this.onDataCollectionAltered.bind(this));
        }

        this.bodyDisplay.drawAllRows();
    }

    onDataEntryModified(storeInstance, entryRecord, actionType) {
        this.dispatchCustomEvent('entryDataChanged', {
            sourceStore: storeInstance,
            recordAffected: entryRecord,
            changeType: actionType
        });
        this.bodyDisplay.refreshSpecificRow(entryRecord);
    }

    onDataCollectionAltered(storeInstance, entryRecord, actionType) {
        this.bodyDisplay.drawAllRows();
        this.updateAllColumnDimensions();
    }

    computeHeaderMetadata() {
        let cumulativeVisibleWeight = 0;
        const processedCols = this.columnDefinitions.map(col => {
            const flexValue = col.weight || 1;
            if (!col.concealed && typeof col.headerLabel === 'string') {
                cumulativeVisibleWeight += flexValue;
            }
            return {
                ...col,
                weightValue: flexValue,
                isVisible: !col.concealed,
                dataProperty: col.dataProperty
            };
        });
        return {
            columns: processedCols,
            totalVisibleWeight: cumulativeVisibleWeight
        };
    }

    calculateTotalColumnWeight(includeHiddenColumns = false) {
        let totalWeight = 0;
        for (const col of this.columnDefinitions) {
            if (includeHiddenColumns || !col.concealed) {
                if (typeof col.headerLabel === 'string') {
                    totalWeight += col.weight || 1;
                }
            }
        }
        return totalWeight;
    }

    getPropertyToIndexMap() {
        const propMap = {};
        this.columnDefinitions.forEach((col, idx) => {
            propMap[col.dataProperty] = idx;
        });
        return propMap;
    }

    adjustColumnDisplay(columnId) {
        let targetColumnIndex;
        if (typeof columnId === 'string') {
            const propMap = this.getPropertyToIndexMap();
            targetColumnIndex = propMap[columnId];
        } else {
            targetColumnIndex = columnId;
        }

        if (targetColumnIndex === undefined || targetColumnIndex < 0 || targetColumnIndex >= this.columnDefinitions.length) {
            return;
        }

        const columnDef = this.columnDefinitions[targetColumnIndex];
        columnDef.concealed = !columnDef.concealed;

        this.headerDisplay.refreshColumnVisibility(columnDef.dataProperty, columnDef.concealed);
        this.bodyDisplay.refreshColumnVisibility(columnDef.dataProperty, columnDef.concealed);

        this.updateAllColumnDimensions();
    }

    updateAllColumnDimensions() {
        const gridRoot = this.getVisualElement();
        const headerRoot = this.headerDisplay.getVisualElement();
        if (!headerRoot) return;

        const actualHeaderWidth = headerRoot.offsetWidth;
        const currentVisibleWeight = this.calculateTotalColumnWeight(false);
        if (currentVisibleWeight === 0) return;

        const weightUnitInPixels = actualHeaderWidth / currentVisibleWeight;
        const propMap = this.getPropertyToIndexMap();

        this.headerDisplay.findDescendants('.grid-header-item').forEach(itemElement => {
            const propId = itemElement.getAttribute('data-property');
            const colIndex = propMap[propId];
            if (colIndex !== undefined) {
                const colDef = this.columnDefinitions[colIndex];
                const flexVal = colDef.weight || 1;
                const calculatedPxWidth = flexVal * weightUnitInPixels;
                itemElement.style.width = `${calculatedPxWidth}px`;
            }
        });

        this.bodyDisplay.findDescendants('.grid-data-cell').forEach(cellElement => {
            const propId = cellElement.getAttribute('data-property');
            const colIndex = propMap[propId];
            if (colIndex !== undefined) {
                const colDef = this.columnDefinitions[colIndex];
                const flexVal = colDef.weight || 1;
                const calculatedPxWidth = flexVal * weightUnitInPixels;
                cellElement.style.width = `${calculatedPxWidth}px`;
            }
        });
    }

    navigateViewToRow(rowIdentifier) {
        const bodyElem = this.bodyDisplay.getVisualElement();
        if (!bodyElem) return;

        let targetRowElem;
        if (typeof rowIdentifier === 'number') {
            const allRows = this.bodyDisplay.findDescendants('.grid-data-row');
            targetRowElem = allRows[rowIdentifier];
        } else if (typeof rowIdentifier === 'object' && this.dataStore) {
            const recordIndex = this.dataStore.getEntryIndex(rowIdentifier);
            const allRows = this.bodyDisplay.findDescendants('.grid-data-row');
            targetRowElem = allRows[recordIndex];
        }

        if (targetRowElem) {
            targetRowElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    getGridBodyView() {
        return this.bodyDisplay;
    }

    connectNewDataSource(newProvider) {
        if (this.dataStore) {
            this.dataStore.unsubscribe('dataModified', this.onDataEntryModified.bind(this));
            this.dataStore.unsubscribe('collectionChanged', this.onDataCollectionAltered.bind(this));
        }
        this.dataStore = newProvider;
        if (this.dataStore) {
            this.dataStore.subscribe('dataModified', this.onDataEntryModified.bind(this));
            this.dataStore.subscribe('collectionChanged', this.onDataCollectionAltered.bind(this));
        }
        this.bodyDisplay.assignNewDataProvider(newProvider);
        this.bodyDisplay.drawAllRows();
        this.updateAllColumnDimensions();
    }

    retrieveDataStore() {
        return this.dataStore;
    }

    obtainRowElement(identifier) {
        let entryIndex;
        if (typeof identifier === 'object') {
            entryIndex = this.retrieveDataStore().getEntryIndex(identifier);
        } else if (typeof identifier === 'number') {
            entryIndex = identifier;
        }

        if (entryIndex !== undefined && entryIndex >= 0) {
            const allRows = this.bodyDisplay.findDescendants('.grid-data-row');
            return allRows[entryIndex];
        }
        return null;
    }
}