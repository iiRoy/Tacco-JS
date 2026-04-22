(function( $ ) {

    // Main plugin definition for jQuery
    // Provides an interactive editor for JavaScript objects, akin to a property list or JSON editor.
    // Dependencies: jQuery, Bootstrap (for styling), JSON polyfill if needed.
    // Usage: $('#myContainer').objectTreeEditor(initialData, { change: myCallback, keyClick: myOtherCallback });
    $.fn.objectTreeEditor = function(initialPayload, editorConfig) {
        editorConfig = editorConfig || {}; // Ensure config object exists

        // A no-operation function to serve as default for callbacks
        var emptyFunc = function() {};
        var dataModifiedCallback = editorConfig.change || emptyFunc;
        var keySelectedCallback = editorConfig.keyClick || emptyFunc;

        // Iterate over each selected DOM element to initialize the editor
        return this.each(function() {
            initializeEditor($(this), initialPayload, dataModifiedCallback, keySelectedCallback);
        });
    };

    /**
     * Initializes a single object tree editor instance.
     * @param {jQuery} renderTarget - The DOM element where the editor will be rendered.
     * @param {object|array} sourceDatum - The JavaScript object or array to be edited.
     * @param {function} changeNotifier - Callback function invoked on data modification.
     * @param {function} propertyNotifier - Callback function invoked when a property key is clicked.
     */
    function initializeEditor(renderTarget, sourceDatum, changeNotifier, propertyNotifier) {
        // Collect runtime options for the current editor instance
        var instSettings = {
            containerElement: renderTarget,
            changeNotifier: changeNotifier,
            propertyNotifier: propertyNotifier,
            originalPayload: sourceDatum, // Reference to the original data structure
        };
        // Begin the recursive rendering process
        renderStructure(instSettings, sourceDatum, renderTarget);
    }

    // --- Type Checking Utilities ---
    // These functions help determine the specific kind of data being processed.

    function isCalendarEntry(val) {
        return Object.prototype.toString.call(val) === '[object Date]';
    }
    function isMap(val) {
        return Object.prototype.toString.call(val) === '[object Object]';
    }
    function isCollection(val) {
        return Object.prototype.toString.call(val) === '[object Array]';
    }
    function isLogical(val) {
        return Object.prototype.toString.call(val) === '[object Boolean]';
    }
    function isQuantity(val) {
        return Object.prototype.toString.call(val) === '[object Number]';
    }
    function isLiteral(val) {
        return Object.prototype.toString.call(val) === '[object String]';
    }

    // --- Data Manipulation Helpers ---

    /**
     * Modifies the data structure at a given path.
     * If `newValue` is provided, sets the value; otherwise, deletes the entry.
     * @param {object|array} targetObj - The object/array to modify.
     * @param {string} dataPath - Dot-separated path to the target property.
     * @param {*} [newValue] - The value to set. If omitted, the property is deleted.
     * @returns {object|array} The modified object.
     */
    function manipulatePathData(targetObj, dataPath, newValue) {
        const shouldDelete = arguments.length === 2;
        if (!dataPath || typeof dataPath !== 'string') {
            logIssue('Invalid path provided to manipulatePathData:', dataPath);
            return targetObj;
        }

        const pathSegments = dataPath.split('.');
        const lastSegmentIdx = pathSegments.length - 1;
        let currentLevel = targetObj;

        // Traverse the object until the parent of the target property
        for (let i = 0; i < lastSegmentIdx; i++) {
            if (!currentLevel || typeof currentLevel !== 'object' || !currentLevel.hasOwnProperty(pathSegments[i])) {
                logIssue('Path segment not found:', pathSegments[i], 'in path:', dataPath);
                return targetObj; // Path does not exist
            }
            currentLevel = currentLevel[pathSegments[i]];
        }

        const finalKey = pathSegments[lastSegmentIdx];

        if (shouldDelete) {
            if (isCollection(currentLevel)) {
                const index = parseInt(finalKey, 10);
                if (!isNaN(index) && index >= 0 && index < currentLevel.length) {
                    currentLevel.splice(index, 1);
                } else {
                    logIssue('Invalid array index for deletion:', finalKey, 'in path:', dataPath);
                }
            } else if (isMap(currentLevel)) {
                delete currentLevel[finalKey];
            }
        } else {
            if (isMap(currentLevel) || isCollection(currentLevel)) {
                 currentLevel[finalKey] = newValue;
            } else {
                logIssue('Cannot set property on non-object/array type at path:', dataPath);
            }
        }
        return targetObj;
    }

    /**
     * Retrieves a nested value from an object using a dot-separated path.
     * Returns `defaultValue` if the path does not exist.
     * @param {object} sourceObj - The object to query.
     * @param {string} pathString - Dot-separated path.
     * @param {*} defaultValue - Value to return if property is not found.
     * @returns {*} The value at the path or the default value.
     */
    function accessNestedValue(sourceObj, pathString, defaultValue) {
        if (!pathString || typeof pathString !== 'string' || !sourceObj) return defaultValue;

        const pathSegments = pathString.split('.');
        let current = sourceObj;
        for (let i = 0; i < pathSegments.length; i++) {
            if (current === undefined || current === null || !current.hasOwnProperty(pathSegments[i])) {
                return defaultValue;
            }
            current = current[pathSegments[i]];
        }
        return current;
    }

    /**
     * Logs an issue to the console.
     * @param {string} reason - The error message.
     * @param {...any} args - Additional arguments to log.
     */
    function logIssue(reason, ...args) {
        if (window.console) {
            console.warn('ObjectTreeEditor Warning:', reason, ...args);
        }
    }

    /**
     * Attempts to parse a JSON string.
     * @param {string} jsonString - The string to parse.
     * @returns {object|array|null} Parsed object or null on failure.
     */
    function tryParsePayload(jsonString) {
        let result;
        try {
            result = JSON.parse(jsonString);
        } catch (e) {
            result = null;
            logIssue('JSON parsing failed:', e.message, 'Input:', jsonString);
        }
        return result;
    }

    /**
     * Attempts to stringify a JavaScript object to JSON.
     * @param {object|array} dataObj - The object to stringify.
     * @returns {string} JSON string or 'null' on failure.
     */
    function encodeToJson(dataObj) {
        let result;
        try {
            result = JSON.stringify(dataObj);
        } catch (e) {
            result = 'null';
            logIssue('JSON stringification failed:', e.message, 'Object:', dataObj);
        }
        return result;
    }

    // --- UI Component Factories ---

    /**
     * Creates a button for collapsing/expanding tree nodes.
     * @returns {jQuery} The expander button element.
     */
    function collapseExpandControl() {
        const controlBtn = $('<button>', { 'class': 'btn btn-default btn-xs expand-toggle' });
        const icon = $('<span>', { 'class': 'glyphicon glyphicon-triangle-right' }); // Default collapsed icon
        controlBtn.append(icon);

        controlBtn.on('click', function() {
            const parentRow = $(this).closest('tr').length ? $(this).closest('tr') : $(this).parent();
            parentRow.toggleClass('expanded');
            if (parentRow.hasClass('expanded')) {
                icon.removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-bottom');
            } else {
                icon.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-right');
            }
        });
        return controlBtn;
    }

    /**
     * Creates an "Add New Value" button.
     * @param {function} clickHandler - Function to execute when the button is clicked.
     * @returns {jQuery} The appender button element.
     */
    function newEntryCreator(clickHandler) {
        const appenderContainer = $('<div>', { 'class': 'editor-item-appender' });
        const addButton = $('<button />', { 'class': 'btn btn-success btn-sm' });
        const plusIcon = $('<span>', { 'class': 'glyphicon glyphicon-plus' });

        addButton.append(plusIcon).append(' Add Item');
        addButton.on('click', clickHandler);
        appenderContainer.append(addButton);
        return appenderContainer;
    }

    /**
     * Creates a delete button for a row.
     * @param {object} instSettings - Editor instance settings.
     * @returns {jQuery} The delete button element wrapped in a cell.
     */
    function entryActions(instSettings) {
        const actionCell = $('<td>', { 'class': 'row-actions-cell' });
        const deleteBtn = $('<button>', { 'class': 'btn btn-danger btn-xs' });
        const deleteIcon = $('<span>', { 'class': 'glyphicon glyphicon-remove' }); // Changed icon

        deleteBtn.append(deleteIcon);
        actionCell.append(deleteBtn);
        deleteBtn.on('click', handleEntryRemoval(instSettings));
        return actionCell;
    }

    /**
     * Adds a new default entry to an object or array.
     * @param {object|array} targetCollection - The collection to modify.
     * @returns {boolean} True if an item was added, false otherwise.
     */
    function appendNewItem(targetCollection) {
        if (isCollection(targetCollection)) {
            targetCollection.push(null); // Add a null entry to an array
            return true;
        }

        if (isMap(targetCollection)) {
            let counter = 1;
            let newKeyCandidate = "newProperty"; // Renamed from "newKey"

            // Ensure the new key is unique
            while (targetCollection.hasOwnProperty(newKeyCandidate)) {
                newKeyCandidate = "newProperty" + counter;
                counter++;
            }

            targetCollection[newKeyCandidate] = null; // Add a null entry to an object
            return true;
        }
        return false;
    }

    /**
     * Determines the conceptual type of a value.
     * @param {*} value - The value to check.
     * @returns {string} The determined type ('date', 'map', 'list', 'logical', 'literal', 'quantity', 'null').
     */
    function identifyValueKind(value) {
        if (value === null) return 'null';
        if (isCalendarEntry(value)) return 'date';
        if (isMap(value)) return 'map';
        if (isCollection(value)) return 'list';
        if (isLogical(value)) return 'logical';
        if (isLiteral(value)) return 'literal';
        if (isQuantity(value)) return 'quantity';
        return 'unknown'; // Fallback for unexpected types
    }

    /**
     * Recursively builds the visual tree representation of the data.
     * @param {object} instSettings - Editor instance settings.
     * @param {*} sourceData - The current data fragment to render.
     * @param {jQuery} renderTarget - The DOM element to append content to.
     * @param {string} [currentPathSegment=''] - The dot-separated path to the current data fragment.
     */
    function renderStructure(instSettings, sourceData, renderTarget, currentPathSegment = '') {
        // Clear existing content before re-rendering
        renderTarget.children().remove();

        const currentKind = identifyValueKind(sourceData);
        let fieldWidget; // Renamed from valueElement

        if (currentKind === 'map') {
            const contentTable = $('<table>', { "class": "table table-striped table-condensed editor-table" });
            const gridBody = $('<tbody>', { 'class': 'map-body' });

            if (Object.keys(sourceData).length === 0) {
                gridBody.append($('<tr><td><em>No properties. Click "Add Item" to add one.</em></td></tr>'));
            } else {
                Object.entries(sourceData).forEach(([propName, propValue]) => {
                    const itemPath = _buildPath(currentPathSegment, propName);
                    const dataEntryRow = $('<tr>', { 'data-path': itemPath, 'data-kind': identifyValueKind(propValue) });
                    const labelCell = $('<th>', { 'scope': 'row', 'class': 'col-md-3' });
                    const keyInput = $('<input>', {
                        'class': 'property-name-input form-control',
                        'type': 'text' // Explicitly set type
                    });
                    keyInput.val(propName).attr('title', propName); // Store original key in title for rename detection
                    labelCell.append(keyInput);

                    keyInput.on('click', handleKeyClick(instSettings));
                    keyInput.on('change', handleKeyRename(instSettings));

                    const contentCell = $('<td>', { 'class': 'value-cell', 'data-kind': identifyValueKind(propValue) });
                    renderStructure(instSettings, propValue, contentCell, itemPath); // Recurse for the value

                    dataEntryRow.append(labelCell).append(contentCell);
                    dataEntryRow.append(entryActions(instSettings)); // Add delete button
                    gridBody.append(dataEntryRow);
                });
            }
            contentTable.append(gridBody);
            renderTarget.append(collapseExpandControl()); // Add expand/collapse control
            renderTarget.append(contentTable);
            renderTarget.append(newEntryCreator(function() {
                appendNewItem(sourceData);
                renderStructure(instSettings, sourceData, renderTarget, currentPathSegment);
                instSettings.changeNotifier(instSettings.originalPayload);
            }));

        } else if (currentKind === 'list') {
            const contentTable = $('<table>', { "class": "table table-striped table-condensed editor-table" });
            const gridBody = $('<tbody>', { 'class': 'list-body' });

            if (sourceData.length === 0) {
                gridBody.append($('<tr><td><em>Empty list. Click "Add Item" to add one.</em></td></tr>'));
            } else {
                sourceData.forEach((itemValue, index) => {
                    const itemPath = _buildPath(currentPathSegment, index);
                    const dataEntryRow = $('<tr>', { 'data-path': itemPath, 'data-kind': identifyValueKind(itemValue) });
                    const indexCell = $('<th>', { 'scope': 'row', 'class': 'index-label' });
                    indexCell.text(index); // Display index
                    dataEntryRow.append(indexCell);

                    const contentCell = $('<td>', { 'class': 'value-cell', 'data-kind': identifyValueKind(itemValue) });
                    renderStructure(instSettings, itemValue, contentCell, itemPath); // Recurse for the item value

                    dataEntryRow.append(contentCell);
                    dataEntryRow.append(entryActions(instSettings)); // Add delete button
                    gridBody.append(dataEntryRow);
                });
            }

            // Make array elements re-orderable using jQuery UI Sortable
            gridBody.sortable({
                items: '> tr',
                containment: 'parent', // Constrain movement within the table body
                axis: 'y', // Only allow vertical dragging
                handle: '.index-label', // Only drag by the index column
                update: function(event, ui) {
                    const reorderedList = [];
                    const subRows = $(event.target).children('tr');

                    $(subRows).each(function() {
                        const rowPath = $(this).data('path');
                        const val = accessNestedValue(instSettings.originalPayload, rowPath);
                        reorderedList.push(val);
                    });

                    // Update the original data model with the reordered list
                    const parentValueCell = $(event.target).closest('td.value-cell');
                    const parentDataRow = parentValueCell.closest('tr');
                    const parentPath = parentDataRow.data('path');

                    manipulatePathData(instSettings.originalPayload, parentPath, reorderedList);
                    renderStructure(instSettings, reorderedList, parentValueCell, parentPath); // Re-render the list
                    instSettings.changeNotifier(instSettings.originalPayload);
                }
            });

            contentTable.append(gridBody);
            renderTarget.append(collapseExpandControl()); // Add expand/collapse control
            renderTarget.append(contentTable);
            renderTarget.append(newEntryCreator(function() {
                appendNewItem(sourceData);
                renderStructure(instSettings, sourceData, renderTarget, currentPathSegment);
                instSettings.changeNotifier(instSettings.originalPayload);
            }));

        } else if (currentKind === 'null') {
            fieldWidget = buildKindSelector(); // Use a type selector for nulls
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));

        } else if (currentKind === 'logical') {
            fieldWidget = booleanCheckbox(sourceData);
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));

        } else if (currentKind === 'literal') {
            const lineCount = (sourceData.match(/\n/g) || []).length + 1;
            // Use textarea for multi-line strings or very long single-line strings
            if (lineCount > 1 || sourceData.length > 60) {
                fieldWidget = $('<textarea>', {
                    'class': 'value-content-input form-control',
                    'rows': Math.min(Math.max(lineCount, 2), 10) // Min 2, max 10 rows
                });
            } else {
                fieldWidget = $('<input>', {
                    'class': 'value-content-input form-control',
                    'type': 'text'
                });
            }
            fieldWidget.val(sourceData);
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));

        } else if (currentKind === 'date') {
            fieldWidget = $('<input>', {
                'class': 'value-content-input form-control',
                'type': 'text' // Using text for simplicity, could be 'datetime-local'
            });
            fieldWidget.val(sourceData.toISOString()); // ISO string representation
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));

        } else if (currentKind === 'quantity') {
            fieldWidget = $('<input>', {
                'class': 'value-content-input form-control',
                'type': 'number', // Use number type for numeric values
                'step': 'any' // Allow floats
            });
            fieldWidget.val(sourceData);
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));

        } else {
            // Fallback for unknown types or primitives not explicitly handled
            fieldWidget = $('<input>', {
                'class': 'value-content-input form-control',
                'type': 'text'
            });
            fieldWidget.val(encodeToJson(sourceData)); // Stringify complex unknown types
            renderTarget.append(fieldWidget);
            fieldWidget.on('change', handleFieldUpdate(instSettings));
        }
    }

    // Helper for building paths
    function _buildPath(base, segment) {
        return base ? `${base}.${segment}` : String(segment);
    }

    /**
     * Creates a checkbox input for boolean values.
     * @param {boolean} currentVal - The initial boolean value.
     * @returns {jQuery} The checkbox input element.
     */
    function booleanCheckbox(currentVal) {
        const checkbox = $('<input />', {
            'type': 'checkbox',
            'class': 'value-content-input form-check-input'
        });
        checkbox.prop("checked", currentVal);
        return checkbox;
    }

    /**
     * Creates a dropdown selector for choosing a new data type for a 'null' value.
     * @returns {jQuery} The select element.
     */
    function buildKindSelector() {
        const typeOptions = [
            { label: 'Select Type...', value: 'null' },
            { label: 'Text (String)', value: 'literal' },
            { label: 'Number (Quantity)', value: 'quantity' },
            { label: 'True/False (Logical)', value: 'logical' },
            { label: 'Date/Time', value: 'date' },
            { label: 'List (Array)', value: 'list' },
            { label: 'Map (Object)', value: 'map' }
        ];

        const selector = $('<select>', { 'class': 'value-content-input form-control' });
        typeOptions.forEach(option => {
            selector.append($("<option>").attr('value', option.value).text(option.label));
        });
        return selector;
    }

    // --- Event Handlers ---

    /**
     * Returns a click handler for property key elements.
     * @param {object} instSettings - Editor instance settings.
     * @returns {function} The click handler.
     */
    function handleKeyClick(instSettings) {
        return function() {
            const dataEntryRow = $(this).closest('tr');
            const itemPath = dataEntryRow.data('path');
            // Notify about the key click, providing a "safe" path string
            instSettings.propertyNotifier(`['${itemPath.split('.').join("']['")}']`);
        };
    }

    /**
     * Returns a change handler for property key input fields.
     * Handles renaming of object keys.
     * @param {object} instSettings - Editor instance settings.
     * @returns {function} The change handler.
     */
    function handleKeyRename(instSettings) {
        return function() {
            const keyInput = $(this);
            const dataEntryRow = keyInput.closest('tr');
            const originalPathRef = dataEntryRow.data('path');
            const updatedKeyName = keyInput.val().trim();
            const previousKeyName = keyInput.attr('title'); // Original key stored in title

            // If the key hasn't changed or is empty, do nothing
            if (updatedKeyName === previousKeyName) {
                return;
            }
            if (!updatedKeyName) {
                logIssue('Property key cannot be empty. Reverting to original.', previousKeyName);
                keyInput.val(previousKeyName);
                return;
            }

            // Extract the value associated with the old key
            const itemValue = accessNestedValue(instSettings.originalPayload, originalPathRef, null);

            // Determine the parent path to check for duplicate keys
            const pathSegments = originalPathRef.split('.');
            const parentPath = pathSegments.slice(0, -1).join('.');
            const parentObject = accessNestedValue(instSettings.originalPayload, parentPath, {});

            if (isMap(parentObject) && parentObject.hasOwnProperty(updatedKeyName) && updatedKeyName !== previousKeyName) {
                logIssue(`Key "${updatedKeyName}" already exists at this level. Reverting.`);
                keyInput.val(previousKeyName);
                return;
            }

            // Delete the old entry
            manipulatePathData(instSettings.originalPayload, originalPathRef);

            // Construct the new path
            const newPathSegments = pathSegments.slice(0, -1);
            newPathSegments.push(updatedKeyName);
            const newPath = newPathSegments.join('.');

            // Insert the value with the new key
            manipulatePathData(instSettings.originalPayload, newPath, itemValue);

            // Update the DOM data-path attribute and title
            dataEntryRow.data('path', newPath).attr('data-path', newPath);
            keyInput.attr('title', updatedKeyName);

            // Re-render the value cell to update any nested paths if necessary
            const valueContentCell = keyInput.parent().next(); // The <td> containing the value
            renderStructure(instSettings, itemValue, valueContentCell, newPath);

            instSettings.changeNotifier(instSettings.originalPayload); // Notify of change
        };
    }

    /**
     * Returns a click handler for delete buttons.
     * @param {object} instSettings - Editor instance settings.
     * @returns {function} The click handler.
     */
    function handleEntryRemoval(instSettings) {
        return function() {
            if (!confirm('Are you sure you want to remove this entry?')) {
                return;
            }

            const dataEntryRow = $(this).closest('tr');
            const itemPath = dataEntryRow.data('path');

            // Remove the entry from the data model
            manipulatePathData(instSettings.originalPayload, itemPath);

            const parentBody = dataEntryRow.closest('tbody');
            const isParentAList = parentBody.hasClass('list-body');

            // If deleting from an array, we need to re-index subsequent items in the DOM and data model
            if (isParentAList) {
                // Get the parent value cell to re-render the entire list
                const parentValueCell = parentBody.closest('td.value-cell');
                const parentDataRow = parentValueCell.closest('tr');
                const parentPath = parentDataRow.data('path');
                const updatedList = accessNestedValue(instSettings.originalPayload, parentPath);
                renderStructure(instSettings, updatedList, parentValueCell, parentPath);
            } else {
                // For objects, simply remove the row
                dataEntryRow.remove();
            }

            instSettings.changeNotifier(instSettings.originalPayload); // Notify of change
        };
    }

    /**
     * Extracts and parses the value from a DOM input element based on its data-kind.
     * @param {jQuery} fieldElement - The input/select/textarea element.
     * @param {string} declaredKind - The data-kind declared on the parent cell.
     * @returns {*} The parsed value.
     */
    function extractDomValue(fieldElement, declaredKind) {
        let extractedValue;

        switch (declaredKind) {
            case 'literal':
                extractedValue = fieldElement.val();
                break;
            case 'date':
                const timestamp = Date.parse(fieldElement.val());
                if (isNaN(timestamp)) {
                    logIssue('Invalid date string entered:', fieldElement.val());
                    fieldElement.closest('td.value-cell').addClass('has-error'); // Visual feedback
                    extractedValue = new Date(0); // Default to epoch or handle as error
                } else {
                    fieldElement.closest('td.value-cell').removeClass('has-error');
                    extractedValue = new Date(timestamp);
                }
                break;
            case 'logical':
                extractedValue = fieldElement.is(':checked');
                break;
            case 'quantity':
                const numVal = parseFloat(fieldElement.val());
                extractedValue = isNaN(numVal) ? 0 : numVal; // Default to 0 or original value on invalid number
                break;
            default:
                // For 'null' type when it was a selector, or any other type not explicitly handled
                // Attempt to parse as JSON, or return as string if that fails
                extractedValue = tryParsePayload(fieldElement.val());
                if (extractedValue === null && fieldElement.val() !== 'null') {
                    // If JSON parse failed and it's not the literal string "null", treat as string
                    extractedValue = fieldElement.val();
                }
                break;
        }
        return extractedValue;
    }

    /**
     * Returns a change handler for value input fields.
     * @param {object} instSettings - Editor instance settings.
     * @returns {function} The change handler.
     */
    function handleFieldUpdate(instSettings) {
        return function() {
            const fieldElement = $(this);
            const dataEntryRow = fieldElement.closest('tr');
            const itemPath = dataEntryRow.data('path');
            const parentValueCell = fieldElement.parent(); // The <td> element

            let newRawValue;
            let finalValue;
            let newKind = parentValueCell.data('kind'); // Get current kind from cell

            if (fieldElement.is('select')) { // This is the type selector for 'null' values
                newKind = fieldElement.val(); // The selected new type
                switch (newKind) {
                    case 'literal': finalValue = ''; break;
                    case 'quantity': finalValue = 0; break;
                    case 'logical': finalValue = false; break;
                    case 'date': finalValue = new Date(); break;
                    case 'list': finalValue = []; break;
                    case 'map': finalValue = {}; break;
                    case 'null':
                    default: finalValue = null; break;
                }
                // Update the data-kind attribute on the cell
                parentValueCell.data('kind', newKind).attr('data-kind', newKind);
                renderStructure(instSettings, finalValue, parentValueCell, itemPath); // Re-render the input based on new type

            } else {
                // For regular input fields, extract the value based on its declared type
                finalValue = extractDomValue(fieldElement, newKind);
            }

            // Update the internal data model
            manipulatePathData(instSettings.originalPayload, itemPath, finalValue);
            instSettings.changeNotifier(instSettings.originalPayload); // Notify of change
        };
    }

})( jQuery );