/* Custom Utility Functions for Adjustable Columns */
function obtainPointerCoord(eventObject) {
    if (eventObject.type.startsWith('touch')) {
        return (eventObject.touches[0] || eventObject.changedTouches[0]).pageX;
    }
    return eventObject.pageX;
}

function extractDimension(elementNode) {
    const styleWidth = elementNode.style.width;
    if (!styleWidth || styleWidth.indexOf('%') === -1) {
        // If width isn't set as percentage, return 0 or null, or try to calculate
        // For consistency with original, assume it's always set as percentage
        return 0;
    }
    return parseFloat(styleWidth.replace('%', ''));
}

function applyDimension(elementNode, value) {
    let finalValue = parseFloat(value.toFixed(2));
    finalValue = Math.max(0, finalValue);
    elementNode.style.width = `${finalValue}%`;
}

/* Simple Custom Event Dispatcher */
function createDispatcher() {
    const registeredListeners = new Map();

    function attach(eventName, callbackFunction) {
        if (!registeredListeners.has(eventName)) {
            registeredListeners.set(eventName, new Set());
        }
        registeredListeners.get(eventName).add(callbackFunction);
    }

    function detach(eventName, callbackFunction) {
        if (registeredListeners.has(eventName)) {
            registeredListeners.get(eventName).delete(callbackFunction);
        }
    }

    function signal(eventName, ...args) {
        if (registeredListeners.has(eventName)) {
            registeredListeners.get(eventName).forEach(callback => {
                try {
                    callback(...args);
                } catch (e) {
                    console.error(`Error executing listener for event '${eventName}':`, e);
                }
            });
        }
    }
    return { attach, detach, signal, registeredListeners }; // Expose registeredListeners for cleanup
}

/* Persistent Width Storage Handler (using localStorage) */
const widthStorage = {
    set(keyIdentifier, dimensionValue) {
        try {
            localStorage.setItem(keyIdentifier, dimensionValue.toString());
        } catch (e) {
            console.warn("Could not save column dimension to local storage:", e);
        }
    },
    get(keyIdentifier) {
        try {
            const storedValue = localStorage.getItem(keyIdentifier);
            return storedValue ? parseFloat(storedValue) : null;
        } catch (e) {
            console.warn("Could not retrieve column dimension from local storage:", e);
            return null;
        }
    }
};

/* Main Factory Function for Adjustable Columns */
function createAdjustableColumns(targetElement, initialSettings) {
    const defaultOptions = {
        columnSelector: 'tr th:visible',
        persistencyAgent: widthStorage,
        synchronizeHandles: true,
        adjustFromBody: true,
        maximumWidth: null,
        minimumWidth: null,
        onResizeStart: null,
        onResizeProgress: null,
        onResizeEnd: null
    };

    const currentSettings = { ...defaultOptions, ...initialSettings };
    const mainTableElement = targetElement;
    let headerCellElements = [];
    let gripContainerElement = null;
    let gripDivs = [];
    const internalDispatcher = createDispatcher();

    // Bind custom event callbacks from settings
    if (currentSettings.onResizeStart) internalDispatcher.attach('columnAdjustStart', currentSettings.onResizeStart);
    if (currentSettings.onResizeProgress) internalDispatcher.attach('columnAdjustProgress', currentSettings.onResizeProgress);
    if (currentSettings.onResizeEnd) internalDispatcher.attach('columnAdjustEnd', currentSettings.onResizeEnd);

    // Internal helper to emit events
    function triggerCustomEvent(eventName, argsArray, originalEvent) {
        internalDispatcher.signal(eventName, mainTableElement, ...argsArray, originalEvent);
    }

    // Generates a unique identifier for column storage
    function getColumnIdentity(columnElement) {
        let tableIdentifier = mainTableElement.dataset.adjustableColumnsId;
        if (!tableIdentifier) {
            tableIdentifier = `tbl-${Math.random().toString(36).substring(2, 9)}`;
            mainTableElement.dataset.adjustableColumnsId = tableIdentifier;
        }
        let columnIdentifier = columnElement.dataset.adjustableColumnId;
        if (!columnIdentifier) {
            columnIdentifier = `col-${Math.random().toString(36).substring(2, 9)}`;
            columnElement.dataset.adjustableColumnId = columnIdentifier;
        }
        return `${tableIdentifier}-${columnIdentifier}`;
    }

    // Applies width constraints from options
    function constrainValue(proposedValue) {
        if (currentSettings.minimumWidth !== null) {
            proposedValue = Math.max(currentSettings.minimumWidth, proposedValue);
        }
        if (currentSettings.maximumWidth !== null) {
            proposedValue = Math.min(currentSettings.maximumWidth, proposedValue);
        }
        return proposedValue;
    }

    // Locates header cells and prepares them
    function setupHeaders() {
        headerCellElements = Array.from(mainTableElement.querySelectorAll(currentSettings.columnSelector));
        normalizeInitialWidths();
        createGrips();
    }

    // Ensures all header cells have percentage widths
    function normalizeInitialWidths() {
        const tableActualWidth = mainTableElement.offsetWidth;
        if (tableActualWidth === 0) return;

        headerCellElements.forEach(cell => {
            if (!cell.style.width || cell.style.width.indexOf('%') === -1) {
                applyDimension(cell, cell.offsetWidth / tableActualWidth * 100);
            }
        });
    }

    // Creates and inserts the resize grip elements
    function createGrips() {
        if (gripContainerElement) {
            gripContainerElement.remove();
        }
        gripContainerElement = document.createElement('div');
        gripContainerElement.className = 'col-adjust-grip-container';
        mainTableElement.parentNode.insertBefore(gripContainerElement, mainTableElement);

        gripDivs = [];
        headerCellElements.forEach((cell, index) => {
            const nextCell = headerCellElements[index + 1];
            if (!nextCell || cell.dataset.noAdjust != null || nextCell.dataset.noAdjust != null) {
                return;
            }

            const grip = document.createElement('div');
            grip.className = 'col-adjust-grip';
            grip.dataset.leftCellIndex = index;
            gripContainerElement.appendChild(grip);
            gripDivs.push(grip);
        });

        gripContainerElement.addEventListener('mousedown', initiateColumnDrag, { passive: false });
        gripContainerElement.addEventListener('touchstart', initiateColumnDrag, { passive: false });
    }

    // Positions grip elements to match column boundaries
    function syncGripPositions() {
        gripContainerElement.style.width = `${mainTableElement.offsetWidth}px`;
        const containerRect = gripContainerElement.getBoundingClientRect();
        const tableHead = mainTableElement.querySelector('thead');
        const height = currentSettings.adjustFromBody ? mainTableElement.offsetHeight : (tableHead ? tableHead.offsetHeight : 0);

        gripDivs.forEach(grip => {
            const leftCellIndex = parseInt(grip.dataset.leftCellIndex, 10);
            const leftCell = headerCellElements[leftCellIndex];
            if (leftCell) {
                const cellRect = leftCell.getBoundingClientRect();
                grip.style.left = `${leftCell.offsetWidth + (cellRect.left - containerRect.left)}px`;
                grip.style.height = `${height}px`;
            }
        });
    }

    // Saves current column widths to persistent storage
    function persistColumnWidths() {
        headerCellElements.forEach(cell => {
            if (cell.dataset.noAdjust == null && currentSettings.persistencyAgent) {
                currentSettings.persistencyAgent.set(getColumnIdentity(cell), extractDimension(cell));
            }
        });
    }

    // Retrieves and applies column widths from persistent storage
    function retrieveColumnWidths() {
        headerCellElements.forEach(cell => {
            if (currentSettings.persistencyAgent) {
                const storedWidth = currentSettings.persistencyAgent.get(getColumnIdentity(cell));
                if (storedWidth !== null) {
                    applyDimension(cell, storedWidth);
                }
            }
        });
    }

    // Handles the start of a column drag operation
    function initiateColumnDrag(eventObject) {
        if (!eventObject.target.classList.contains('col-adjust-grip')) {
            return;
        }
        eventObject.preventDefault();

        const activeGrip = eventObject.target;
        const leftCellIndex = parseInt(activeGrip.dataset.leftCellIndex, 10);
        const leftColumnElement = headerCellElements[leftCellIndex];
        const rightColumnElement = headerCellElements[leftCellIndex + 1];

        if (!leftColumnElement || !rightColumnElement) return;

        const startingPointerCoord = obtainPointerCoord(eventObject);
        const initialColumnWidths = {
            left: extractDimension(leftColumnElement),
            right: extractDimension(rightColumnElement)
        };
        const updatedColumnWidths = { ...initialColumnWidths };

        mainTableElement.classList.add('col-adjust-resizing-table');
        gripContainerElement.classList.add('col-adjust-resizing-table');
        leftColumnElement.classList.add('col-adjust-resizing-column');
        rightColumnElement.classList.add('col-adjust-resizing-column');
        activeGrip.classList.add('col-adjust-resizing-column');

        triggerCustomEvent('columnAdjustStart', [leftColumnElement, rightColumnElement, updatedColumnWidths.left, updatedColumnWidths.right], eventObject);

        const moveHandler = (moveEvent) => {
            moveEvent.preventDefault();
            const coordinateDifference = (obtainPointerCoord(moveEvent) - startingPointerCoord) / mainTableElement.offsetWidth * 100;

            const newLeftWidth = constrainValue(initialColumnWidths.left + coordinateDifference);
            const newRightWidth = constrainValue(initialColumnWidths.right - coordinateDifference);

            updatedColumnWidths.left = newLeftWidth;
            updatedColumnWidths.right = newRightWidth;

            applyDimension(leftColumnElement, updatedColumnWidths.left);
            applyDimension(rightColumnElement, updatedColumnWidths.right);

            if (currentSettings.synchronizeHandles) {
                syncGripPositions();
            }
            triggerCustomEvent('columnAdjustProgress', [leftColumnElement, rightColumnElement, updatedColumnWidths.left, updatedColumnWidths.right], moveEvent);
        };

        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            document.removeEventListener('touchend', upHandler);

            mainTableElement.classList.remove('col-adjust-resizing-table');
            gripContainerElement.classList.remove('col-adjust-resizing-table');
            leftColumnElement.classList.remove('col-adjust-resizing-column');
            rightColumnElement.classList.remove('col-adjust-resizing-column');
            activeGrip.classList.remove('col-adjust-resizing-column');

            syncGripPositions();
            persistColumnWidths();
            triggerCustomEvent('columnAdjustEnd', [leftColumnElement, rightColumnElement, updatedColumnWidths.left, updatedColumnWidths.right], eventObject);
        };

        document.addEventListener('mousemove', moveHandler, { passive: false });
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('mouseup', upHandler);
        document.addEventListener('touchend', upHandler);
    }

    // Handles window resize to re-sync grip positions
    const windowResizeObserver = () => {
        syncGripPositions();
    };

    // Module initialization logic
    function initializeModule() {
        setupHeaders();
        retrieveColumnWidths();
        syncGripPositions();
        window.addEventListener('resize', windowResizeObserver);
    }

    // Public API for the module instance
    const publicInterface = {
        // Renamed from 'destroy'
        eliminate: function() {
            if (gripContainerElement) {
                gripContainerElement.removeEventListener('mousedown', initiateColumnDrag);
                gripContainerElement.removeEventListener('touchstart', initiateColumnDrag);
                gripContainerElement.remove();
                gripContainerElement = null;
            }
            window.removeEventListener('resize', windowResizeObserver);
            headerCellElements.forEach(cell => {
                cell.classList.remove('col-adjust-resizing-column');
                delete cell.dataset.adjustableColumnId;
            });
            mainTableElement.classList.remove('col-adjust-resizing-table');
            delete mainTableElement.dataset.adjustableColumnsId;
            headerCellElements = [];
            gripDivs = [];
            internalDispatcher.registeredListeners.clear();
        },
        // Renamed from 'setHeaders' or re-initialization
        reconfigure: function() {
            setupHeaders();
            syncGripPositions();
        },
        // Renamed from 'saveColumnWidths'
        storeCurrentDimensions: function() {
            persistColumnWidths();
        },
        // Renamed from 'restoreColumnWidths'
        retrievePreviousDimensions: function() {
            retrieveColumnWidths();
            syncGripPositions();
        },
        // Expose event listener methods
        onEvent: internalDispatcher.attach,
        offEvent: internalDispatcher.detach
    };

    initializeModule();
    return publicInterface;
}

/* Global exposure as a utility function, similar to a jQuery plugin */
if (typeof window !== 'undefined') {
    const instanceRegistry = new WeakMap();

    window.adjustTableColumns = function(target, operationOrOptions) {
        let actualElement = target;
        if (typeof target === 'string') {
            actualElement = document.querySelector(target);
        }
        if (!(actualElement instanceof HTMLElement)) {
            console.error("Invalid target provided for adjustTableColumns. Must be an HTMLElement or a valid selector string.");
            return null;
        }

        let currentInstance = instanceRegistry.get(actualElement);

        // Handle method calls (e.g., adjustTableColumns(element, 'eliminate'))
        if (typeof operationOrOptions === 'string') {
            if (currentInstance && typeof currentInstance[operationOrOptions] === 'function') {
                const methodArguments = Array.prototype.slice.call(arguments, 2);
                return currentInstance[operationOrOptions].apply(currentInstance, methodArguments);
            } else {
                console.warn(`Method "${operationOrOptions}" not found or instance not initialized for this element.`);
                return null;
            }
        }

        // Handle initialization or retrieve existing instance
        if (!currentInstance) {
            currentInstance = createAdjustableColumns(actualElement, operationOrOptions);
            instanceRegistry.set(actualElement, currentInstance);
        } else {
            // If options object is passed again, it's typically ignored by jQuery plugins
            // unless destroy() is called first. We'll return the existing instance.
        }

        return currentInstance;
    };
}