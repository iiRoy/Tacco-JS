'use strict';

// This module provides functionality for a flexible, editable data structure viewer.
angular.module('StructuralDataEditor', ['ui.sortable'])
.directive('updateOnBlur', function() {
    // Custom directive to ensure ngModel updates on blur event,
    // useful for input fields where immediate keystroke updates are not desired.
    // Based on a common pattern found in Angular 1.x examples.
    return {
        restrict: 'A', // Attribute directive
        require: 'ngModel', // Requires ngModel controller
        link: function(currentScope, domElement, elementAttributes, modelController) {
            // Guard clause: Do not apply to radio or checkbox inputs as they have different update mechanisms.
            if (elementAttributes.type === 'radio' || elementAttributes.type === 'checkbox') return;

            // Ensure ngModelController is available before proceeding.
            if (!modelController) {
                console.warn('updateOnBlur: ngModelController not found on element', domElement);
                return;
            }

            // Remove default Angular input/keydown/change listeners to prevent immediate updates.
            domElement.unbind('input').unbind('keydown').unbind('change');

            // Bind to the 'blur' event to trigger model update.
            domElement.on('blur', function() {
                // Safely apply changes within Angular's digest cycle.
                currentScope.$apply(function() {
                    // Update the ngModel's view value with the current element value.
                    modelController.$setViewValue(domElement.val());
                });         
            });
        }
    };
})
.directive('dataTreeNode', ["$compileService", function($compileService) { // Renamed $compile to $compileService
  return {
    restrict: 'E', // Element directive
    scope: {
      nodeData: '=', // Renamed 'child' to 'nodeData'
      nodeType: '@', // Renamed 'type' to 'nodeType'
      isInitiallyCollapsed: '=' // Renamed 'defaultCollapsed' to 'isInitiallyCollapsed'
    },
    link: function(currentScope, hostElement, hostAttributes) { // Renamed scope, element, attributes
        // Constants for data type labels
        const stringLabel = "StringValue"; // Renamed stringName
        const objectLabel = "ObjectContainer"; // Renamed objectName
        const arrayLabel = "ArrayCollection"; // Renamed arrayName
        const referenceLabel = "DataReference"; // Renamed refName
        const booleanLabel = "BooleanFlag"; // Renamed boolName
        
        // Define available data types for new item creation
        currentScope.availableDataTypes = [stringLabel, objectLabel, arrayLabel, referenceLabel, booleanLabel]; // Renamed valueTypes
        
        // Configuration for sortable lists (used for arrays)
        currentScope.dragDropOptions = { // Renamed sortableOptions
            axis: 'y' // Allow vertical dragging
        };

        // Initialize node collapse state and icon
        currentScope.isNodeCollapsed = currentScope.isInitiallyCollapsed === undefined ? false : currentScope.isInitiallyCollapsed; // Renamed collapsed, simplified ternary
        currentScope.collapseIcon = currentScope.isNodeCollapsed ? "glyphicon-chevron-right" : "glyphicon-chevron-down"; // Renamed chevron

        // --- Helper functions for data manipulation and type checking ---

        /**
         * Determines the fundamental type of a JavaScript value.
         * @param {*} value The value to check.
         * @returns {string} One of "Object", "Array", "Boolean", or "Literal".
         */
        const resolveValueType = function(value) { // Renamed getType
            const internalType = Object.prototype.toString.call(value);
            switch (internalType) { // Changed if/else if to switch
                case "[object Object]": return "Object";
                case "[object Array]": return "Array";
                case "[object Boolean]": return "Boolean";
                default: return "Literal"; // Covers strings, numbers, null, undefined
            }
        };

        /**
         * Checks if a value can be parsed as a finite number.
         * @param {*} input The value to check.
         * @returns {boolean} True if it's a valid number, false otherwise.
         */
        const isValidNumeric = function(input) { // Renamed isNumber
          return !isNaN(parseFloat(input)) && isFinite(input);
        };

        /**
         * Converts a string to a number if it represents a valid number, otherwise returns the original string.
         * Handles null, undefined, and empty string inputs gracefully.
         * @param {string} inputValue The string value to potentially convert.
         * @returns {*} The number or the original string.
         */
        currentScope.attemptNumberConversion = function(inputValue) { // Renamed possibleNumber
            if (inputValue === null || inputValue === undefined || inputValue === '') { // Added null/undefined/empty string check
                return inputValue; // Return as is, or could return null/undefined based on desired behavior
            }
            return isValidNumeric(inputValue) ? parseFloat(inputValue) : inputValue;
        };
        
        // Expose type resolver to scope for template use
        currentScope.getNodeValueType = function(value) { // Renamed scope.getType
            return resolveValueType(value);
        };

        /**
         * Toggles the collapsed state of the current node and updates its chevron icon.
         */
        currentScope.toggleNodeVisibility = function() { // Renamed toggleCollapse
            currentScope.isNodeCollapsed = !currentScope.isNodeCollapsed; // Toggled state directly
            currentScope.collapseIcon = currentScope.isNodeCollapsed ? "glyphicon-chevron-right" : "glyphicon-chevron-down";
        };

        /**
         * Renames a key within an object.
         * @param {object} targetObject The object containing the key.
         * @param {string} oldKey The current key name.
         * @param {string} newKey The desired new key name.
         */
        currentScope.updateObjectKey = function(targetObject, oldKey, newKey) { // Renamed moveKey
            if (oldKey === newKey) { // No change needed
                return;
            }
            if (!targetObject || typeof targetObject !== 'object' || targetObject === null) { // Added guard clauses for invalid object
                console.warn("Attempted to update key on an invalid target object.", targetObject);
                return;
            }

            // Ensure newKey is a non-empty string
            if (!newKey || typeof newKey !== 'string' || newKey.trim() === '') {
                // Revert tempKeyHolder to oldKey if newKey is invalid
                currentScope.tempKeyHolder = oldKey;
                alert("New key name cannot be empty.");
                return;
            }

            if (targetObject.hasOwnProperty(newKey)) { // Added check for existing newKey
                if (!confirm(`The key "${newKey}" already exists. Do you wish to overwrite it?`)) {
                    currentScope.tempKeyHolder = oldKey; // Revert if user cancels
                    return;
                }
            }
            targetObject[newKey] = targetObject[oldKey]; // Copy value to new key
            delete targetObject[oldKey]; // Remove old key
        };

        /**
         * Deletes an item from an object or array.
         * @param {object|Array} containerRef The object or array to delete from.
         * @param {string|number} identifier The key (for objects) or index (for arrays) of the item to delete.
         */
        currentScope.removeNodeItem = function(containerRef, identifier) { // Renamed deleteKey
            if (!containerRef) { // Guard clause
                console.warn("Attempted to delete from an undefined container reference.");
                return;
            }

            const itemType = resolveValueType(containerRef);
            let confirmationMessage = '';

            if (itemType === "Object") {
                confirmationMessage = `Are you absolutely certain you want to delete the property "${identifier}" and all its nested content?`;
                if (confirm(confirmationMessage)) {
                    delete containerRef[identifier];
                }
            } else if (itemType === "Array") {
                // For arrays, identifier is the index, we can't show the "name" easily without fetching the item first.
                // Simplified message.
                confirmationMessage = `Confirm deletion of the item currently at index ${identifier}? This action cannot be undone.`;
                if (confirm(confirmationMessage)) {
                    containerRef.splice(identifier, 1);
                }
            } else {
                // This case should ideally not be reached if directive logic is sound, but good for debugging.
                console.error("Invalid container type encountered for item deletion: " + itemType, containerRef);
            }
        };

        /**
         * Generates a default value based on the specified data type.
         * @param {string} dataType The type of value to create.
         * @returns {*} The default value.
         */
        const createDefaultValue = function(dataType) { // New helper function
            switch(dataType) {
                case stringLabel: return "";
                case objectLabel: return {};
                case arrayLabel: return [];
                case booleanLabel: return false;
                case referenceLabel: return {"_refPlaceholder_": "pending_reference"}; // Modified default reference
                default: return null; // Fallback
            }
        };

        /**
         * Adds a new item to the current object or array node.
         * Performs validation for object keys.
         */
        currentScope.addNewItem = function(targetCollection) { // Renamed addItem
            currentScope.validationMessage = ''; // Clear previous validation messages

            if (!targetCollection) { // Guard clause
                currentScope.validationMessage = "Target collection for addition is undefined.";
                return;
            }

            const collectionType = resolveValueType(targetCollection);
            const selectedItemType = currentScope.selectedNewItemType; // Renamed valueType

            if (collectionType === "Object") {
                const newPropertyKey = currentScope.newEntryKey; // Renamed keyName

                // Input validation for object keys
                if (!newPropertyKey || newPropertyKey.trim().length === 0) { // More robust check
                    currentScope.validationMessage = "Property name cannot be empty. Please provide a valid key.";
                    return;
                }
                if (newPropertyKey.startsWith("$") || newPropertyKey.startsWith("_")) { // Used startsWith
                    currentScope.validationMessage = "Property name cannot start with '$' or '_'. These are reserved prefixes.";
                    return;
                }
                if (newPropertyKey.length > 60) { // Added length validation
                    currentScope.validationMessage = "Property name is too long (maximum 60 characters).";
                    return;
                }

                if (targetCollection.hasOwnProperty(newPropertyKey)) { // Check for existing key
                    if (!confirm(`A property named "${newPropertyKey}" already exists. Do you want to replace its value?`)) {
                        return; // User cancelled replacement
                    }
                }
                
                // Add item to object
                let itemValue;
                if (selectedItemType === stringLabel) {
                    itemValue = currentScope.attemptNumberConversion(currentScope.newEntryValue || ''); // Renamed valueName, added default
                } else {
                    itemValue = createDefaultValue(selectedItemType);
                }
                targetCollection[newPropertyKey] = itemValue;

            } else if (collectionType === "Array") {
                // Add item to array
                let itemValue;
                if (selectedItemType === stringLabel) {
                    itemValue = currentScope.attemptNumberConversion(currentScope.newEntryValue || '');
                } else {
                    itemValue = createDefaultValue(selectedItemType);
                }
                targetCollection.push(itemValue);

            } else {
                currentScope.validationMessage = "Unsupported collection type for adding items. Operation aborted.";
                console.error("Object to add to was " + targetCollection); // Keep error for unexpected types
                return;
            }

            // Clean-up after successful addition
            currentScope.newEntryKey = "";
            currentScope.newEntryValue = "";
            currentScope.showAddItemControls = false; // Renamed showAddKey
            currentScope.validationMessage = ''; // Clear message after success
        };

        // --- Template Generation ---
        // These templates define the visual structure and interactive elements for displaying JSON data.
        
        // Template for recursively rendering different data types.
        const recursiveNodeTemplate = 
            '<span ng-switch on="getNodeValueType(nodeItemVal)" >' // Renamed switch condition
                + '<data-tree-node ng-switch-when="Object" node-data="nodeItemVal" node-type="object" is-initially-collapsed="isInitiallyCollapsed"></data-tree-node>' // Renamed directive and attributes
                + '<data-tree-node ng-switch-when="Array" node-data="nodeItemVal" node-type="array" is-initially-collapsed="isInitiallyCollapsed"></data-tree-node>' // Renamed directive and attributes
                + '<span ng-switch-when="Boolean" class="boolean-flag-editor">' // Renamed class
                    + '<input type="checkbox" ng-model="nodeItemVal" update-on-blur ng-change="nodeData[nodeKey] = nodeItemVal">' // Renamed directive, model, change target
                + '</span>'
                + '<span ng-switch-default class="json-literal-value-editor"><input type="text" ng-model="nodeItemVal" ' // Renamed class
                    + 'placeholder="Enter value" update-on-blur ng-change="nodeData[nodeKey] = attemptNumberConversion(nodeItemVal)"/>' // Renamed directive, model, change target
                + '</span>'
            + '</span>';
        
        // Template for the "Add New Item" controls (button vs. input fields)
        const newItemControlsTemplate = 
        '<div ng-switch on="showAddItemControls" class="add-item-section" >' // Renamed switch condition and class
            + '<span ng-switch-when="true" class="add-item-input-group">'; // Renamed class
                if (currentScope.nodeType === "object"){ // Changed scope.type
                   // Input field for new property key (only for objects)
                    newItemControlsTemplate += '<input placeholder="New Property Name" type="text" ui-keyup="{\'enter\':\'addNewItem(nodeData)\'}" ' // Renamed placeholder, function
                        + 'class="form-control input-sm property-key-input-field" ng-model="$parent.newEntryKey" /> '; // Renamed class, model
                }
                newItemControlsTemplate += 
                // Dropdown for selecting the type of the new value
                '<select ng-model="$parent.selectedNewItemType" ng-options="option for option in availableDataTypes" class="form-control input-sm data-type-dropdown"' // Renamed model, options, class
                    + 'ng-init="$parent.selectedNewItemType=\''+stringLabel+'\'" ui-keydown="{\'enter\':\'addNewItem(nodeData)\'}"></select>' // Renamed init value, function
                // Input field for new value (only for string type)
                + '<span ng-show="$parent.selectedNewItemType === \''+stringLabel+'\'"> : <input type="text" placeholder="Value for String" ' // Renamed placeholder
                    + 'class="form-control input-sm property-value-input-field" ng-model="$parent.newEntryValue" ui-keyup="{\'enter\':\'addNewItem(nodeData)\'}"/></span> ' // Renamed class, model
                // Add button
                + '<button class="btn btn-primary btn-sm add-new-item-button" ng-click="addNewItem(nodeData)">Add Entry</button> ' // Renamed class, function, button text
                + '<button class="btn btn-default btn-sm cancel-add-item-button" ng-click="$parent.showAddItemControls=false; $parent.validationMessage=\'\'">Cancel</button>' // Renamed class, action, added validation message clear
                + '<div ng-if="$parent.validationMessage" class="alert alert-danger validation-error-message">{{ $parent.validationMessage }}</div>' // Added validation message display
            + '</span>'
            + '<span ng-switch-default class="add-item-toggler-section">' // Renamed class
                // Plus button to show add item controls
                + '<button class="btn btn-sm btn-success activate-add-mode-button" ng-click="$parent.showAddItemControls = true"><i class="glyphicon glyphicon-plus"></i> Add New Item</button>' // Renamed class, text
            + '</span>'
        + '</div>';
    
        // Construct the main template based on whether the node is an object or an array.
        let mainNodeStructure; // Renamed template
        if (currentScope.nodeType === "object"){ // Changed scope.type
            mainNodeStructure = '<i ng-click="toggleNodeVisibility()" class="glyphicon" ng-class="collapseIcon"></i>' // Renamed function, class
            + '<span class="object-node-description">'+objectLabel+'</span>' // Renamed class
            + '<div class="object-node-contents" ng-hide="isNodeCollapsed">' // Renamed class, hide condition
                // Repeat through key-value pairs in the object
                + '<span class="data-entry-block" ng-hide="nodeKey && nodeKey.startsWith(\'_\')" ng-repeat="(nodeKey, nodeItemVal) in nodeData track by nodeKey">' // Renamed class, ng-hide, repeat variables, added track by
                    // Object key input field
                    + '<span class="object-property-key-container">' // Renamed class
                        + '<input class="property-key-renamer-input" type="text" ng-model="tempKeyHolder" ng-init="tempKeyHolder=nodeKey" ' // Renamed class, model, init
                            + 'ng-blur="updateObjectKey(nodeData, nodeKey, tempKeyHolder)"/>' // Renamed function
                        // Delete button for the property
                        + '<i class="action-delete-property-btn glyphicon glyphicon-trash" ng-click="removeNodeItem(nodeData, nodeKey)"></i>' // Renamed class, function
                    + '</span>'
                    // Object value rendered recursively
                    + '<span class="object-property-value-display">' + recursiveNodeTemplate + '</span>' // Renamed class
                + '</span>'
                // Add new item controls specific to objects
                + newItemControlsTemplate
            + '</div>';
        } else if (currentScope.nodeType === "array") { // Changed scope.type
            mainNodeStructure = '<i ng-click="toggleNodeVisibility()" class="glyphicon"' // Renamed function
            + 'ng-class="collapseIcon"></i>' // Renamed class
            + '<span class="array-node-description">'+arrayLabel+'</span>' // Renamed class
            + '<div class="array-node-contents" ng-hide="isNodeCollapsed">' // Renamed class, hide condition
                + '<ol class="array-ordered-list" ui-sortable="dragDropOptions" ng-model="nodeData">' // Renamed class, sortable options, model
                    // Repeat through array items
                    + '<li class="array-item-entry" ng-repeat="nodeItemVal in nodeData track by $index">' // Renamed class, repeat variable, added track by
                        // Delete button for array item
                        + '<i class="action-delete-array-item-btn glyphicon glyphicon-trash" ng-click="removeNodeItem(nodeData, $index)"></i>' // Renamed class, function
                        // Drag handle for sorting array items
                        + '<i class="move-array-item-handle glyphicon glyphicon-align-justify"></i>' // Renamed class
                        // Array item value rendered recursively
                        + '<span class="array-item-value-display">' + recursiveNodeTemplate + '</span>' // Added span for consistency
                    + '</li>'
                + '</ol>'
                // Add new item controls specific to arrays
                + newItemControlsTemplate
            + '</div>';
        } else {
            console.error("Unsupported node type encountered for rendering: "+ currentScope.nodeType + ". Displaying error fallback."); // Keep error
            mainNodeStructure = '<div class="error-node-display alert alert-danger">Error: Unknown or unsupported data node type specified.</div>'; // Added fallback error message
        }

        // Compile the generated template and link it to the current scope.
        const compiledNodeElement = $compileService(mainNodeStructure)(currentScope); // Renamed variable, service
        hostElement.replaceWith(compiledNodeElement); // Replace the original directive element with the compiled template
    }
  };
}]);