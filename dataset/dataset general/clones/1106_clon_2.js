(function( jq ) {
    // This module provides a flexible UI component for editing nested data structures.
    // Version: 1.0.0
    // License: MIT

    // Key Dependencies for Operation:
    // - jQuery (tested with v1.x series)
    // - Bootstrap 3 (for styling, not strictly required but highly recommended)
    // - JSON (modern browsers have native support; use json2.js for older environments)

    // Usage Example:
    //      jq('#myContainer').dataStructureEditor(initialJsonObject, editorConfiguration);

    jq.fn.dataStructureEditor = function(sourceData, configSettings) {
        // Initialize configuration settings, providing a default empty object
        configSettings = configSettings || {};
        
        // A no-operation function to serve as a default callback
        var noopFunc = function() {};
        
        // Assign callbacks from configuration or use the no-op function
        var dataModifiedCallback = configSettings.change || noopFunc;
        var elementClickedCallback = configSettings.propertyclick || noopFunc;

        // Iterate over each selected DOM element to apply the editor
        return this.each(function() {
            initDataEditor(jq(this), sourceData, dataModifiedCallback, elementClickedCallback);
        });

    };

    /**
     * Initializes the data editing interface for a given target element.
     * @param {jQuery} containerElement The jQuery object representing the target DOM element.
     * @param {object} sourceData The JavaScript object to be edited.
     * @param {function} dataModifiedCallback Callback function invoked on data changes.
     * @param {function} elementClickedCallback Callback function for property clicks.
     * @param {jQuery} [keyDisplay] Optional: The element displaying the key.
     * @param {jQuery} [valueDisplay] Optional: The element displaying the value.
     */
    function initDataEditor(containerElement, sourceData, dataModifiedCallback, elementClickedCallback, keyDisplay, valueDisplay) {
        // Prepare a configuration object for internal use
        var editorConfig = {
            containerElement: containerElement,
            dataModifiedCallback: dataModifiedCallback,
            elementClickedCallback: elementClickedCallback,
            initialData: sourceData,
        };
        // Begin the recursive construction of the editor UI
        buildStructure(editorConfig, sourceData, containerElement);
    }

    // Helper functions to determine the type of a given variable.
    function checkIsDate(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object Date]';
    }
    function checkIsPlainObject(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object Object]';
    }
    function checkIsCollection(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object Array]';
    }
    function checkIsLogicValue(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object Boolean]';
    }
    function checkIsNumeric(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object Number]';
    }
    function checkIsWholeNumber(inputVar) {
        return (checkIsNumeric(inputVar) && Math.round(inputVar) === inputVar);
    }
    function checkIsText(inputVar) {
        return Object.prototype.toString.call(inputVar) === '[object String]';
    }
    // A string containing all recognized data types for quick lookup.
    var knownDataTypes = 'object array boolean number string date null';

    /**
     * Modifies an object by setting a value at a specified path or deleting a key.
     * @param {object} targetObject The object to modify.
     * @param {string} pathString The dot-separated path to the property.
     * @param {*} [newValue] The value to set. If omitted, the property is deleted.
     * @returns {object} The modified object.
     */
    function updateDataPath(targetObject, pathString, newValue) {
        // Determine if the operation is a deletion (two arguments means delete)
        var shouldDelete = arguments.length === 2;
        
        // Handle nested paths
        if (pathString.indexOf('.') > -1) {
            var currentBranch = targetObject,
                idx = 0,
                pathSegments = pathString.split('.');
            for (var segmentCount = pathSegments.length; idx < segmentCount - 1; idx++) {
                currentBranch = currentBranch[pathSegments[idx]];
            }
            // Perform deletion or assignment on the deepest branch
            if (shouldDelete) {
                if (determineDataType(currentBranch) === 'array') {
                    var arrayIndex = pathSegments[segmentCount - 1];
                    currentBranch.splice(arrayIndex, 1);
                } else {
                    delete currentBranch[pathSegments[segmentCount - 1]];
                }
            } else {
                currentBranch[pathSegments[segmentCount - 1]] = newValue;
            }
        } else {
            // Handle top-level paths
            if (shouldDelete) {
                if (determineDataType(targetObject) === 'array') {
                    targetObject.splice(pathString, 1);
                } else {
                    delete targetObject[pathString];
                }
            } else {
                targetObject[pathString] = newValue;
            }
        }
        return targetObject;
    }

    /**
     * Retrieves a value from an object using a dot-separated path.
     * Returns a fallback value if the path does not exist.
     * @param {object} sourceObject The object to query.
     * @param {string} pathString The dot-separated path.
     * @param {*} fallbackValue The value to return if the path is not found.
     * @returns {*} The value at the path or the fallback value.
     */
    function retrievePathValue(sourceObject, pathString, fallbackValue) {
        var pathComponents = pathString.split('.');
        var componentIndex = 0;
        while (componentIndex < pathComponents.length) {
            sourceObject = sourceObject[pathComponents[componentIndex++]];
            if (sourceObject === undefined) {
                return fallbackValue;
            }
        }
        return sourceObject;
    }

    // Logs an error message to the console if available.
    function logErrorIssue(issueReason) {
        if (window.console) {
            console.error(issueReason);
        }
    }
    
    /**
     * Parses a JSON string into a JavaScript object.
     * @param {string} jsonString The JSON string to parse.
     * @returns {object|null} The parsed object or null if parsing fails.
     */
    function decodeJsonString(jsonString) {
        var resultObject;
        try {
            resultObject = JSON.parse(jsonString);
        } catch (parsingError) {
            resultObject = null;
            logErrorIssue('JSON parsing failed: ' + parsingError.message);
        }
        return resultObject;
    }

    /**
     * Converts a JavaScript object into a JSON string.
     * @param {object} dataToEncode The object to stringify.
     * @returns {string} The JSON string representation or 'null' on failure.
     */
    function encodeJsonData(dataToEncode) {
        var encodedResult;
        try {
            encodedResult = JSON.stringify(dataToEncode);
        } catch (encodingError) {
            encodedResult = 'null';
            logErrorIssue('JSON stringification failed: ' + encodingError.message);
        }
        return encodedResult;
    }
    
    /**
     * Creates and returns a UI control for expanding/collapsing sections.
     * @returns {jQuery} The expander jQuery object.
     */
    function createToggleControl() {
        var toggleSpan = jq('<span>', { 'class': 'expander' });
        toggleSpan.bind('click', function() {
            var parentItem = jq(this).parent();
            parentItem.toggleClass('expanded');
        });
        return toggleSpan;
    }

    /**
     * Generates a button for adding new items to a collection.
     * @param {function} clickHandler The function to execute when the button is clicked.
     * @returns {jQuery} The jQuery object for the add item button.
     */
    function createAddItemButton(clickHandler) {
        var addButtonContainer = jq('<div>', { 'class': 'item appender' }),
            actionButton = jq('<button />', { 'class': 'btn btn-success btn-xs' }),
            iconSpan = jq('<span>', { 'class': 'glyphicon glyphicon-plus' });

        actionButton.append(iconSpan);
        actionButton.click(clickHandler);
        addButtonContainer.append(actionButton);
        return addButtonContainer;
    }

    /**
     * Creates the column containing controls for a table row (e.g., delete button).
     * @param {object} editorConfig The editor's configuration object.
     * @returns {jQuery} The jQuery object for the row controls cell.
     */
    function createRowActionButtons(editorConfig) {
        var actionCell = jq('<td>',
                             { 'class': 'row-controls', 'width': '24px' }),
            deleteButton = jq('<button>', { 'class': 'btn btn-danger btn-xs' }),
            deleteIconSpan = jq('<span>',
                        { 'class': 'glyphicon glyphicon-minus' });
        deleteButton.append(deleteIconSpan);
        actionCell.append(deleteButton);
        deleteButton.click(handleRowDeletion(editorConfig));
        return actionCell;
    }

    /**
     * Adds a default new entry (null value) to an object or array.
     * @param {object|array} targetCollection The collection to modify.
     * @returns {boolean} True if an entry was added, false otherwise.
     */
    function addDefaultEntry(targetCollection) {
        if (checkIsCollection(targetCollection)) {
            targetCollection.push(null);
            return true;
        }

        if (checkIsPlainObject(targetCollection)) {
            var idxCounter = 1, generatedKeyName = "newKey";

            while (targetCollection.hasOwnProperty(generatedKeyName)) {
                generatedKeyName = "newKey" + idxCounter;
                idxCounter++;
            }

            targetCollection[generatedKeyName] = null;
            return true;
        }

        return false;
    }

    /**
     * Recursively builds the editor UI based on the provided data object.
     * @param {object} editorConfig Configuration for the editor instance.
     * @param {object|array|primitive} currentDataObject The current data segment to render.
     * @param {jQuery} parentElement The DOM element where the UI will be appended.
     * @param {string} [currentPath] The dot-separated path to currentDataObject.
     */
    function buildStructure(editorConfig, currentDataObject, parentElement, currentPath) {
        currentPath = currentPath || '';
        parentElement.children().remove(); // Clear existing content
        var dataTypeKind = determineDataType(currentDataObject);

        if (dataTypeKind === 'dict') { // Handling objects (dictionaries)
            var dataGrid = jq('<table>',
                          { "class": "table table-striped table-condensed" }),
                gridBody = jq('<tbody>', { 'class': 'dict' });

            for (var propKey in currentDataObject) {
                if (currentDataObject.hasOwnProperty(propKey)) {
                    var fullDataPath = (currentPath ? currentPath + '.' : '') + propKey;
                    var gridRow = jq('<tr>', { 'data-path': fullDataPath });
                    var keyHeaderCell = jq('<th>',
                                      { 'scope': 'row', 'class': 'col-sm-3' });
                    var keyInputField = jq('<input>',
                        { 'class': 'property form-control' });
                    keyInputField.val(propKey).attr('title', propKey);
                    keyHeaderCell.append(keyInputField);
                    keyInputField.click(handlePropertyClickEvent(editorConfig));
                    keyInputField.change(handlePropertyUpdateEvent(editorConfig));
                    var valueDataCell = jq('<td>',
                                     { 'data-type': determineDataType(currentDataObject[propKey]) });
                    // Recurse for the value
                    buildStructure(editorConfig, currentDataObject[propKey], valueDataCell, fullDataPath);
                    gridRow.append(keyHeaderCell).append(valueDataCell);
                    gridRow.append(createRowActionButtons(editorConfig));
                    gridBody.append(gridRow);
                }
            }
            dataGrid.append(gridBody);
            parentElement.append(createToggleControl());
            parentElement.append(dataGrid);
            parentElement.append(createAddItemButton(function() {
                    addDefaultEntry(currentDataObject);
                    buildStructure(editorConfig, currentDataObject, parentElement, currentPath);
                    editorConfig.dataModifiedCallback(editorConfig.initialData);
            }));
        } else if (dataTypeKind === 'array') { // Handling arrays
            var dataGrid = jq('<table>',
                          { "class": "table table-striped table-condensed" }),
                gridBody = jq('<tbody>', { 'class': 'array' });

            for (var itemIndex = 0; itemIndex < currentDataObject.length; ++itemIndex) {
                var fullDataPath = (currentPath ? currentPath + '.' : '') + itemIndex;
                var gridRow = jq('<tr>', { 'data-path': fullDataPath });
                var keyHeaderCell = jq('<th>',
                                  { 'scope': 'row' });
                var valueDataCell = jq('<td>',
                                 { 'data-type': determineDataType(currentDataObject[itemIndex]),
                                  'width': '100%' });
                // Recurse for the array element
                buildStructure(editorConfig, currentDataObject[itemIndex], valueDataCell, fullDataPath);
                gridRow.append(keyHeaderCell);
                gridRow.append(valueDataCell);
                gridRow.append(createRowActionButtons(editorConfig));
                gridBody.append(gridRow);
            }
            // Enable drag-and-drop reordering for array elements
            gridBody.sortable({
                items: '> tr',
                containment: 'table',
                update: function( sortEvent, sortUI ) {
                    var reorderedCollection = [],
                        rowElements = jq(sortEvent.target).children('tr');
                    
                    jq(rowElements).each(function() {
                        var itemPath = jq(this).data('path'),
                            itemValue = retrievePathValue(editorConfig.initialData, itemPath);
                        reorderedCollection.push(itemValue);
                    });
                    var targetValueCell = jq(sortEvent.target).closest('td'),
                        containerRow = targetValueCell.closest('tr'),
                        parentPath = containerRow.data('path');
                    updateDataPath(editorConfig.initialData, parentPath, reorderedCollection);
                    buildStructure(editorConfig, reorderedCollection, targetValueCell, parentPath);
                    editorConfig.dataModifiedCallback(editorConfig.initialData);
                }
            });
            dataGrid.append(gridBody);
            parentElement.append(createToggleControl());
            parentElement.append(dataGrid);
            parentElement.append(createAddItemButton(function() {
                    addDefaultEntry(currentDataObject);
                    buildStructure(editorConfig, currentDataObject, parentElement, currentPath);
                    editorConfig.dataModifiedCallback(editorConfig.initialData);
            }));
        } else if (dataTypeKind === 'null') { // Handling null values
            var inputControl = createTypeSelector();
            parentElement.append(inputControl);
            inputControl.change(handleValueUpdateEvent(editorConfig));
        } else if (dataTypeKind === 'boolean') { // Handling boolean values
            var inputControl = createCheckboxControl(currentDataObject);
            parentElement.append(inputControl);
            inputControl.change(handleValueUpdateEvent(editorConfig));
        } else if (dataTypeKind === 'string') { // Handling string values
            var lineCount = currentDataObject.split('\n').length;
            if (lineCount === 1 && currentDataObject.length > 79) { lineCount = 2; } // Adjust rows for long single lines
            var inputControl = jq('<textarea>',
                            { 'class': 'value form-control', 'rows': lineCount });
            inputControl.val(currentDataObject);
            parentElement.append(inputControl);
            inputControl.change(handleValueUpdateEvent(editorConfig));
        } else { // Handling numbers, dates, etc. (primitive types)
            var inputControl = jq('<input>',
                             { 'class': 'value form-control' });
            if (dataTypeKind === 'date') {
                var displayValue = currentDataObject.toISOString();
            } else {
                var displayValue = encodeJsonData(currentDataObject);
            }
            inputControl.val(displayValue).attr('title', displayValue);
            parentElement.append(inputControl);
            inputControl.change(handleValueUpdateEvent(editorConfig));
        }
    }

    /**
     * Creates a checkbox input element initialized with a given boolean value.
     * @param {boolean} currentCheckState The initial checked state of the checkbox.
     * @returns {jQuery} The jQuery object for the checkbox.
     */
    function createCheckboxControl(currentCheckState) {
        var checkboxInput = jq('<input />',
            { 'type': 'checkbox', 'class': 'value' }).prop(
                "checked", currentCheckState);
        return checkboxInput;
    }

    /**
     * Generates a dropdown selector for choosing data types when a null value is encountered.
     * @returns {jQuery} The jQuery object for the type selector dropdown.
     */
    function createTypeSelector() {
        var typeOptionsArray = [
          { valueOption: null,       displayLabel: 'Select type' },
          { valueOption: 'string',   displayLabel: 'String' },
          { valueOption: 0,          displayLabel: 'Integer' },
          { valueOption: false,      displayLabel: 'Boolean' },
          { valueOption: new Date(), displayLabel: 'Date' },
          { valueOption: [],         displayLabel: 'Array' },
          { valueOption: {},         displayLabel: 'Dict' }
        ];

        var selectorDropdown = jq('<select>', { 'class': 'value form-control' });
        jq(typeOptionsArray).each(function() {
            selectorDropdown.append(jq("<option>").attr('value',
                encodeJsonData(this.valueOption)).text(this.displayLabel));
        });
        return selectorDropdown;
    }

    /**
     * Returns a click handler for property key elements.
     * Invokes the onpropertyclick callback with the path.
     * @param {object} editorConfig The editor's configuration object.
     * @returns {function} The click event handler.
     */
    function handlePropertyClickEvent(editorConfig) {
        return function() {
            var containingRow = jq(this).closest('tr'),
            itemPath = jq(containingRow).data('path');
            var escapedPath = itemPath.split('.').join('\'][\'');
            editorConfig.elementClickedCallback('[\'' + escapedPath + '\']');
        };
    }

    /**
     * Provides a change handler for property key input fields.
     * Updates the data structure with the new key name and re-renders.
     * @param {object} editorConfig The editor's configuration object.
     * @returns {function} The change event handler.
     */
    function handlePropertyUpdateEvent(editorConfig) {
        return function() {
            // The parent of 'this' is <th>; its parent is <tr>
            var containingRow = jq(this).closest('tr'),
                oldDataPath = jq(containingRow).data('path'),
                updatedKeyName = jq(this).val(),
                originalKeyName = jq(this).attr('title'),
                currentValue = retrievePathValue(editorConfig.initialData, oldDataPath, null);

            // Store the new key as the title for future reference
            jq(this).attr('title', updatedKeyName);

            // Remove the old key-value pair from the data model
            updateDataPath(editorConfig.initialData, oldDataPath);
            // Insert the new key-value pair
            if (updatedKeyName) {
                // Calculate the new path based on the updated key
                var pathComponents = oldDataPath.split('.');
                pathComponents.pop(); // Remove the old key
                pathComponents.push(updatedKeyName); // Add the new key
                var newDataPath = pathComponents.join('.');
                updateDataPath(editorConfig.initialData, newDataPath, currentValue);
                // Update the data-path attribute on the table row
                jq(containingRow).data('path', newDataPath);
                // jQuery doesn't update the DOM attribute directly, so do it explicitly
                jq(containingRow).attr('data-path', newDataPath);
                // All sub-elements' paths need to be updated, so reconstruct the value's UI
                // The 'th' is jq(this).parent(); the next sibling is 'td' (value)
                var targetValueCell = jq(this).parent().next();
                buildStructure(editorConfig, currentValue, targetValueCell, newDataPath);
            } else {
                // If the new key is empty, delete the row entirely
                jq(containingRow).remove();
            }
            editorConfig.dataModifiedCallback(editorConfig.initialData);
        };
    }

    /**
     * Creates and returns a click handler for deleting a row.
     * Removes the corresponding data entry and updates the UI.
     * @param {object} editorConfig The editor's configuration object.
     * @returns {function} The click event handler for row deletion.
     */
    function handleRowDeletion(editorConfig){
        return function() {
            // The parent of 'this' is <td>; its parent is <tr>
            var containingRow = jq(this).closest('tr'),
                itemPath = jq(containingRow).data('path');
            // Remove the key-value pair from the data model
            encodeJsonData(updateDataPath(editorConfig.initialData, itemPath)); // stringify here for side effect, not value

            // If it's an array, subsequent row paths might need adjustment
            if (jq(containingRow).closest('tbody').hasClass('array')) {
                var subsequentRow = jq(containingRow).next('tr');
                while (jq(subsequentRow).data('path')) {
                    var currentPath = jq(subsequentRow).data('path');
                    var pathComponents = currentPath.split('.');
                    var lastPathComponent = pathComponents.pop();
                    pathComponents.push(parseInt(lastPathComponent) - 1); // Decrement index
                    currentPath = pathComponents.join('.');
                    jq(subsequentRow).data('path', currentPath);
                    jq(subsequentRow).attr('data-path', currentPath); // Explicit DOM update
                    subsequentRow = jq(subsequentRow).next('tr');
                }
            }
            jq(containingRow).remove(); // Remove the row from the UI
            editorConfig.dataModifiedCallback(editorConfig.initialData);
        };
    }

    /**
     * Extracts the value from a UI input element, parsing it based on its inferred type.
     * @param {jQuery} inputElement The jQuery object for the input element.
     * @returns {*} The parsed value.
     */
    function extractCellValue(inputElement) {
        var inferredType = jq(inputElement).parent().data('type');
        var extractedValue;

        if (inferredType === 'string') {
            // For strings, return the raw value from the input field.
            extractedValue = jq(inputElement).val();
        } else if (inferredType === 'date') {
            // Attempt to parse as a valid date.
            var dateTimestamp = Date.parse(jq(inputElement).val());
            if (isNaN(dateTimestamp)) {
                // Invalid date string entered.
                alert("Invalid date format detected!");
                jq(inputElement).closest('td').addClass('danger'); // Highlight error
                dateTimestamp = 0; // Default to epoch or similar
            } else {
                jq(inputElement).parent().closest('td').removeClass('danger'); // Clear error
            }
            extractedValue = new Date(dateTimestamp);
        } else if (inferredType === 'boolean') {
            // For booleans, check the 'checked' property of the checkbox.
            extractedValue = jq(inputElement).is(':checked');
        } else {
            // For other types (number, object, array, null), parse as JSON.
            extractedValue = decodeJsonString(jq(inputElement).val() || 'null');
            // TODO: Potentially add validation here to ensure type consistency (e.g., number wasn't changed to boolean).
        }
        return extractedValue;
    }

    /**
     * Returns a change handler for value input elements.
     * Updates the data model and potentially re-renders the UI if the type changes.
     * @param {object} editorConfig The editor's configuration object.
     * @returns {function} The change event handler.
     */
    function handleValueUpdateEvent(editorConfig) {
        return function() {
            var updatedValue = null,
                containingRow = jq(this).closest('tr'),
                itemPath = jq(containingRow).data('path');

            if (jq(this).is('select')) {
                // This is a type selector (for null values); determine the new type.
                updatedValue = decodeJsonString(jq(this).val() || 'null');
                var newDataType = determineDataType(updatedValue);
                if (newDataType === 'string') {
                    // Strings and dates both appear as strings in JSON.
                    // Try parsing as a date if it looks like one.
                    var dateTimestamp = Date.parse(updatedValue);
                    if (!isNaN(dateTimestamp)) {
                        newDataType = 'date';
                        updatedValue = new Date(dateTimestamp);
                    }
                }
                jq(this).parent().data('type', newDataType); // Update internal data type
                jq(this).parent().attr('data-type', newDataType); // Update DOM attribute explicitly
                buildStructure(editorConfig, updatedValue, jq(this).parent(), itemPath); // Reconstruct UI for new type
            } else {
                // For other input types, simply extract the value.
                updatedValue = extractCellValue(jq(this));
            }
            updateDataPath(editorConfig.initialData, itemPath, updatedValue);
            editorConfig.dataModifiedCallback(editorConfig.initialData);
        };
    }

    /**
     * Determines the specific data type of a given value.
     * @param {*} inputVal The value to check.
     * @returns {string} A string representing the data type (e.g., 'dict', 'array', 'string').
     */
    function determineDataType(inputVal) {
        var inferredType = 'null';
        
        if (checkIsDate(inputVal)) inferredType = 'date';
        else if (checkIsPlainObject(inputVal)) inferredType = 'dict'; // Renamed from 'object' for clarity
        else if (checkIsCollection(inputVal)) inferredType = 'array';
        else if (checkIsLogicValue(inputVal)) inferredType = 'boolean';
        else if (checkIsText(inputVal)) inferredType = 'string';
        else if (checkIsNumeric(inputVal)) inferredType = 'number';
        return inferredType;
    }

})( jQuery );