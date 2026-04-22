'use strict';

angular.module('appModules', [])
    /**
     * @ngdoc directive
     * @name multiSelectBtn
     *
     * @description
     * The 'multiSelectBtn' directive renders a UI component featuring a multi-choice dropdown.
     * This dropdown is styled as a standard Bootstrap button with an indicator caret.
     * The selection status of each choice is maintained within a local object called 'optionStatuses'.
     *
     * @element - any
     * @param multi-select-btn - the primary data object containing the tree of dropdown choices;
     *     each selectable leaf in this tree must possess an "id" property.
     * @param button-text - the display text for the button.
     * @param button-style - supplementary CSS classes for the button.
     * @param complete-action - a function that receives the final selection results. The argument
     *     is an object where property names are the IDs of the tree leaves, and values are booleans
     *     indicating their "checked" state.
     *     Example: {"456":true,"987":false,"3":true}
     * @param is-activated - a predicate function to determine if the control is active or disabled.
     *
     * @author pbosin
     */
    .directive('multiSelectBtn', function() {
        return {
            scope: {
                choicesData: '=multiSelectBtn',
                completeAction: '&callback',
                buttonText: '@',
                isActivated: '&'
            },
            controller: function(viewModel, attributes) {

                viewModel.buttonClass = attributes.btncls;

                viewModel.possessesChildren = function(element) {
                    return (typeof(element.items) !== "undefined" && element.items.length > 0);
                };

                viewModel.flipDropdown = function() {
                    if (viewModel.isActivated()) {
                        viewModel.isExpanded = !viewModel.isExpanded;
                    }
                };

                function isMarked(node) {
                    var idx;
                    if (!node || typeof(node) === "undefined") {
                        return false;
                    }
                    if (typeof(node.items) === "undefined" || node.items.length === 0) {
                        // This is a tree leaf element
                        return typeof(node.id) !== "undefined" && optionStatuses[node.id];
                    } else {
                        // Traverse through child elements
                        for (idx in node.items) {
                            if (!isMarked(node.items[idx])) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
                viewModel.getMarkedState = function(element) {
                    return isMarked(element);
                };

                function updateItemStatus(node, newCondition) {
                    var idx;
                    if (viewModel.possessesChildren(node)) {
                        for (idx in node.items) {
                            updateItemStatus(node.items[idx], newCondition);
                        }
                    } else {
                        optionStatuses[node.id] = newCondition;
                    }
                }
                viewModel.chooseOption = function(node) {
                    var newCondition = !isMarked(node);
                    updateItemStatus(node, newCondition);
                    return false;
                };

                function storeOutcome(node, finalOutput) {
                    var idx;
                    if (viewModel.possessesChildren(node)) {
                        for (idx in node.items) {
                            storeOutcome(node.items[idx], finalOutput);
                        }
                    } else {
                        finalOutput["" + node.id] = optionStatuses[node.id];
                    }
                }
                viewModel.finalizeSelection = function() {
                    var finalOutput = {};
                    storeOutcome(viewModel.choicesData, finalOutput);
                    viewModel.flipDropdown();
                    viewModel.completeAction({ res: finalOutput });
                };

                function addStatusEntry(statusMap, element) {
                    var idx;
                    if (typeof(element) !== "undefined" && viewModel.possessesChildren(element)) {
                        for (idx in element.items) {
                            addStatusEntry(statusMap, element.items[idx]);
                        }
                    } else {
                        statusMap[element.id] = (typeof(element.checked) !== "undefined" && element.checked);
                    }
                }
                function initializeStatuses(dataElements) {
                    var statusMap = {}, idx;
                    if (typeof(dataElements) !== "undefined") {
                        for (idx in dataElements) {
                            addStatusEntry(statusMap, dataElements[idx]);
                        }
                    }
                    return statusMap;
                }
                var optionStatuses = initializeStatuses(viewModel.choicesData.items);
            },
            templateUrl: 'multi-select-button-template.html'
        };
    });