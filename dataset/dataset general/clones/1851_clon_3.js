'use strict'; // Enforces stricter parsing and error handling for the code.

// Define a read-only empty array for safe default assignments.
const IMMUTABLE_EMPTY_LIST = Object.freeze([]);

// Declare the main Angular module for UI components.
angular.module('myWidgets', [])
    /**
     * @ngdoc directive
     * @name multiSelectDropdown
     *
     * @description
     * This UI component renders a multi-selection dropdown.
     * It presents itself as a styled button (e.g., Bootstrap-like) with a caret.
     * The selection status of individual options within the tree structure is managed internally.
     *
     * @restrict E // This directive is intended to be used as an element (e.g., <multi-select-dropdown>).
     * @param {Object} dropdown-data-source - The hierarchical data object representing the dropdown options.
     *     Each selectable leaf node must possess a unique 'nodeId' property.
     * @param {string} button-display-text - The text string shown on the primary button.
     * @param {string=} button-css-class - Optional CSS class(es) to apply to the main button element.
     * @param {function(Object)} on-selection-finalized - A callback function invoked upon selection confirmation.
     *     It receives an object where keys are 'nodeId' values and boolean values indicate selection status.
     *     Example: `{"category1_item1": true, "category2_item3": false}`
     * @param {function(): boolean} is-control-enabled - A function that returns a boolean to determine
     *     if the dropdown button is currently active and clickable.
     *
     * @author WidgetArchitect
     */
    .directive('multiSelectDropdown', function () {
        // Return the directive's definition object.
        return {
            restrict: 'E', // Specifies that this directive can only be used as an element.
            scope: {
                // Bi-directional data binding for the options tree.
                dropdownDataSource: '=dropdownDataSource',
                // Expression binding for the callback function on selection completion.
                onSelectionFinalized: '&onSelectionFinalized',
                // One-way string binding for the button's display text.
                buttonDisplayText: '@buttonDisplayText',
                // Expression binding for determining if the control is active.
                isControlEnabled: '&isControlEnabled'
            },
            controller: ['$scope', '$attrs', function (viewScope, attributes) { // Renamed $scope to viewScope, $attrs to attributes
                // Assign any custom CSS classes for the button, defaulting if none provided.
                viewScope.buttonCustomClass = attributes.buttonCssClass || 'btn-outline-secondary';

                // Internal state to track the visibility of the dropdown pane.
                viewScope.isPaneVisible = false;

                // Private helper function to determine if a given data node has child elements.
                const nodeHasChildren = (dataNode) => {
                    // Check if the node is valid, has a 'childItems' property, and it's a non-empty array.
                    return !!dataNode && Array.isArray(dataNode.childItems) && dataNode.childItems.length > 0;
                };
                // Expose the helper to the viewScope for potential use in the template.
                viewScope.nodeHasChildren = nodeHasChildren;

                // Function to toggle the visibility of the dropdown pane.
                viewScope.togglePaneVisibility = () => {
                    // Only allow toggling if the control is currently enabled.
                    if (viewScope.isControlEnabled()) {
                        viewScope.isPaneVisible = !viewScope.isPaneVisible;
                    } else {
                        // Optionally log or provide feedback if the control is disabled.
                        console.warn('Attempted to toggle a disabled dropdown: ', viewScope.buttonDisplayText);
                    }
                };

                // A map to hold the boolean selection status for each item, keyed by its unique nodeId.
                let itemSelectionStatusMap = {};

                // Recursive private function to check if a specific node (and all its children) is selected.
                const checkNodeAndDescendantsSelected = (currentNode) => {
                    // Early exit for invalid node.
                    if (!currentNode || !currentNode.nodeId) {
                        return false;
                    }

                    // If it's a leaf node (no children), check its individual status.
                    if (!nodeHasChildren(currentNode)) {
                        return itemSelectionStatusMap[currentNode.nodeId] === true;
                    } else {
                        // If it has children, all children must be selected.
                        return currentNode.childItems.every(child => checkNodeAndDescendantsSelected(child));
                    }
                };
                // Expose this check to the viewScope.
                viewScope.isNodeSelected = checkNodeAndDescendantsSelected;

                // Recursive private function to update the selection state of a node and its entire subtree.
                const applySelectionStateToNode = (targetNode, newSelectionState) => {
                    // Guard against null/undefined nodes.
                    if (!targetNode) {
                        return;
                    }

                    if (nodeHasChildren(targetNode)) {
                        // Recursively apply the state to all child items.
                        targetNode.childItems.forEach(childItem => {
                            applySelectionStateToNode(childItem, newSelectionState);
                        });
                    } else {
                        // For a leaf node, update its status in the map.
                        itemSelectionStatusMap[targetNode.nodeId] = newSelectionState;
                    }
                };

                // Handler for when a user clicks on an individual item within the dropdown.
                viewScope.handleItemActivation = (clickedNode) => {
                    // Determine the new state by toggling the current state.
                    const desiredSelectionState = !checkNodeAndDescendantsSelected(clickedNode);
                    applySelectionStateToNode(clickedNode, desiredSelectionState);
                    return false; // Prevent default browser action (e.g., link navigation).
                };

                // Recursive private function to gather all final selection states into a result object.
                const aggregateFinalSelections = (node, finalResultContainer) => {
                    // Validate input parameters.
                    if (!node || typeof finalResultContainer !== 'object') {
                        return;
                    }

                    if (nodeHasChildren(node)) {
                        node.childItems.forEach(child => aggregateFinalSelections(child, finalResultContainer));
                    } else {
                        // Ensure nodeId is treated as a string key for consistency.
                        finalResultContainer[String(node.nodeId)] = itemSelectionStatusMap[node.nodeId] || false;
                    }
                };

                // Function called when the user confirms their selections (e.g., clicks an "Apply" button).
                viewScope.commitSelections = () => {
                    const compiledResults = {};
                    // Start collecting results from the top-level data source.
                    aggregateFinalSelections(viewScope.dropdownDataSource, compiledResults);

                    viewScope.togglePaneVisibility(); // Close the dropdown pane.
                    // Invoke the provided callback with the compiled selection results.
                    viewScope.onSelectionFinalized({ selectionOutcome: compiledResults });
                };

                // Private recursive function to populate the initial selection map from the data source.
                const populateInitialStates = (initialMap, currentDataNode) => {
                    // Basic validation for the node and map.
                    if (!currentDataNode || typeof initialMap !== 'object') {
                        return;
                    }

                    if (nodeHasChildren(currentDataNode)) {
                        currentDataNode.childItems.forEach(child => populateInitialStates(initialMap, child));
                    } else {
                        // Set initial state based on 'isPreselected' property, defaulting to false.
                        initialMap[currentDataNode.nodeId] = !!currentDataNode.isPreselected;
                    }
                };

                // Private function to initialize the entire selection status map based on the input data.
                const setupInitialSelections = (nodeList) => {
                    // Ensure we are working with an array of nodes.
                    if (!Array.isArray(nodeList)) {
                        return {};
                    }

                    const newSelectionMap = {};
                    nodeList.forEach(node => populateInitialStates(newSelectionMap, node));
                    return newSelectionMap;
                };

                // Initialize the selection states when the controller first loads.
                // We assume the actual tree data is under 'rootItems' property of dropdownDataSource.
                itemSelectionStatusMap = setupInitialSelections(
                    viewScope.dropdownDataSource && viewScope.dropdownDataSource.rootItems || IMMUTABLE_EMPTY_LIST
                );

                // Watch for changes in the primary data source to re-initialize selection states.
                // This ensures the dropdown reacts to external data updates.
                viewScope.$watch('dropdownDataSource.rootItems', (newValues, oldValues) => {
                    if (newValues !== oldValues) { // Only re-initialize if the data reference changes.
                        itemSelectionStatusMap = setupInitialSelections(newValues || IMMUTABLE_EMPTY_LIST);
                    }
                }, true); // Use deep watching to detect changes within the array/object structure.

                // Lifecycle hook: Clean up resources when the controller's scope is destroyed.
                viewScope.$on('$destroy', () => {
                    console.log('multiSelectDropdown: Controller scope is being destroyed. Clearing selection states.');
                    itemSelectionStatusMap = {}; // Clear the map to prevent memory leaks.
                    // Further cleanup (e.g., unregistering event listeners) could be added here.
                });
            }],
            templateUrl: 'widgets/dropdowns/multi-select-dropdown-layout.html' // Updated path for the HTML template.
        };
    });