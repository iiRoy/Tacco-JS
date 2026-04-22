'use strict'
// This ensures strict mode is enabled for the entire script.

angular.module('pbComponents', [
    /* No dependencies for this module */
])
    /*
     * @ngdoc directive
     * @name ngTreeBtn
     *
     * @description
     * The `ngTreeBtn` directive is responsible for rendering a multi-select dropdown component.
     * It presents itself as a Bootstrap button with a dropdown caret.
     * The checked status of individual options is managed internally within `checkMarks`.
     *
     * @element - Can be applied to any HTML element.
     * @param {object} ng-tree-btn - The primary data source for the dropdown options.
     *     This object represents a tree structure. Each leaf node within this tree
     *     must be selectable and must possess a unique "id" property.
     * @param {string} label - The display text that appears on the button itself.
     * @param {string} btnCls - An optional string containing additional CSS class names
     *     to be applied to the button for custom styling.
     * @param {function} callback - A function that will be invoked upon selection confirmation.
     *     It receives a single argument: an object where keys are the IDs of the tree leaves
     *     and values are booleans indicating their checked status (e.g., `{"123": true, "763": false}`).
     * @param {function} enabled - A function that returns a boolean, determining if the button
     *     and its dropdown functionality should be enabled or disabled.
     *
     * @author pbosin
     */
    .directive(
        'ngTreeBtn',
        function () {
            return {
                scope: { // Define isolated scope properties for the directive
                    options: '=ngTreeBtn', // Two-way binding for the tree data
                    handleRes: '&callback', // Expression binding for the callback function
                    label: '@', // One-way string binding for the button label
                    isEnabled: '&' // Expression binding for the enabled state check
                },
                controller: function (
                    $scope,
                    $attrs
                ) {

                    // Initialize button classes from attributes
                    $scope.btnCls = $attrs.btncls;

                    /**
                     * Checks if a given item in the tree has children.
                     * @param {object} item - The tree item to check.
                     * @returns {boolean} True if the item has a non-empty 'items' array, false otherwise.
                     */
                    $scope.hasChildren = function ( item ) {
                        // Check if 'items' property exists and is not empty
                        return ( typeof( item.items ) !== "undefined" && item.items.length > 0 );
                    };

                    /**
                     * Toggles the dropdown's opened/closed state.
                     * Only toggles if the directive is enabled.
                     */
                    $scope.toggleDrop = function ( ) {
                        // Check if the directive is currently enabled
                        if ( $scope.isEnabled( ) ) {
                            // Invert the 'opened' state
                            $scope.opened = ! $scope.opened;
                        }
                    };


                    // Helper function to determine if an item (or its children) is checked
                    function isChecked ( obj ) {
                        var i; /* Loop counter */

                        // Handle undefined or null objects gracefully
                        if ( ! obj || typeof( obj ) === "undefined" ) {
                            return false;
                        }

                        // If it's a leaf node (no 'items' or empty 'items' array)
                        if ( typeof( obj.items ) === "undefined" || obj.items.length == 0 ) {
                            // A leaf node is checked if its ID exists in checkMarks and is true
                            return typeof( obj.id ) !== "undefined" && checkMarks[ obj.id ];
                        } else {
                            // If it's a branch node, traverse its children
                            for ( i in obj.items ) {
                                // If any child is NOT checked, then the parent is also NOT fully checked
                                if ( ! isChecked( obj.items[ i ] ) ) {
                                    return false;
                                }
                            }
                            // All children are checked, so this branch is considered checked
                            return true;
                        }
                    }

                    // Expose isChecked functionality to the scope
                    $scope.checked = function ( item ) {
                        return isChecked( item );
                    };


                    // Recursively sets the checked state for an item and its children
                    function setItemCheck ( obj, newState ) {
                        var i; // Loop index

                        // If the object has children, recurse into them
                        if ( $scope.hasChildren( obj ) ) {
                            for ( i in obj.items ) {
                                setItemCheck( obj.items[ i ], newState );
                            }
                        } else {
                            // If it's a leaf node, update its state in checkMarks
                            checkMarks[ obj.id ] = newState;
                        }
                    }

                    // Toggles the checked state of a selected item
                    $scope.selectItem = function ( obj ) {
                        // Determine the new state (inverse of current)
                        var newState = ! isChecked( obj );
                        // Apply the new state recursively
                        setItemCheck( obj, newState );
                        // Prevent default event propagation (e.g., checkbox click)
                        return false;
                    };


                    // Recursively collects the final selection results
                    function saveResult( obj, result ) {
                        var i; // Loop iterator

                        // If the current object has children
                        if ( $scope.hasChildren( obj ) ) {
                            // Recurse for each child
                            for ( i in obj.items ) {
                                saveResult( obj.items[ i ], result );
                            }
                        } else {
                            // If it's a leaf node, store its checked status in the result object
                            result[ "" + obj.id ] = checkMarks[ obj.id ];
                        }
                    }

                    // Confirms the multi-selection and triggers the callback
                    $scope.confirmMulti = function () {
                        var result = {}; // Initialize an empty result object
                        // Populate the result object with current selections
                        saveResult( $scope.options, result );
                        // Close the dropdown after confirmation
                        $scope.toggleDrop( );
                        // Invoke the callback with the final results
                        $scope.handleRes( { res: result } );
                    };


                    // Adds individual item's checked status to the `chks` object
                    function addChk( chks, item ) {
                        var i; // Loop variable

                        // Check if the item is defined and has children
                        if ( typeof( item ) !== "undefined" && $scope.hasChildren( item ) ) {
                            // If it has children, recursively add their checked status
                            for ( i in item.items ) {
                                addChk( chks, item.items[ i ] );
                            }
                        } else {
                            // If it's a leaf, set its initial checked status based on 'item.checked'
                            chks[ item.id ] = ( typeof( item.checked ) !== "undefined" && item.checked );
                        }
                    }

                    // Initializes the `checkMarks` object based on the initial tree structure
                    function initChks( items ) {
                        var chks = {}, /* The object to hold initial checked states */
                            i;        /* Loop counter */

                        // Only proceed if 'items' are defined
                        if ( typeof( items ) !== "undefined" ) {
                            // Iterate through the top-level items and add their checked states
                            for ( i in items ) {
                                addChk( chks, items[ i ] );
                            }
                        }
                        return chks; // Return the initialized checked states
                    }

                    // Initialize the global checkMarks object when the controller starts
                    var checkMarks = initChks( $scope.options.items );
                },
                templateUrl: 'ng-tree-btn.html' // Path to the directive's HTML template
            };
        }
    );