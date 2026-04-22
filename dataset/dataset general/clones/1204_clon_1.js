// jslint configuration for this file, enabling specific linting rules.
/* jslint bitwise:true, white:true, plusplus:true, vars:true, browser:true, devel:true, regexp:true */
// Global variables provided by external libraries or the environment.
/* global angular:true, rison:true, $:true */

// Encapsulates the application logic within an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global namespace.
( function () {

    "use strict"; // Enforce strict mode for cleaner code and fewer silent errors.


    /**
     * Converts an array of objects into a pretty-printed JSON string,
     * specifically for array-like structures where each element is serialized separately.
     * @param {Array} obj - The array of objects to serialize.
     * @returns {string} A JSON string representation of the array.
     */
    function toJsonPretty( obj ) {
        // Initialize an empty array to hold the serialized elements.
        var res = [ ];

        // Iterate over each element in the input array.
        obj.forEach( function ( elem ) {
            // Serialize each element using the $serial service's toJsonL method
            // and push the result into the 'res' array.
            res.push( $serial.toJsonL( elem ) );
        } );

        // Join all serialized elements with a comma and a newline for readability,
        // then append a final newline character.
        return res.join( ",\n" ) + "\n";
    }


    /**
     * Deserializes a pretty-printed JSON string back into an object array.
     * This function expects the input JSON to represent an array of objects.
     * @param {string} json - The JSON string to deserialize.
     * @returns {Array} An array of deserialized objects.
     */
    function fromJsonPretty( json ) {
        // Wrap the input JSON string in square brackets to form a valid JSON array string,
        // then use the $serial service to deserialize it.
        return $serial.fromJsonL( '[' + json + ']' );
    }


    // Definition of the main Angular module for the keyboard layout application.
    // It depends on 'ngSanitize' for HTML sanitization and 'ui.utils' for utility functions.
    var kbApp = angular.module( 'kbApp', [ "ngSanitize", "ui.utils" ] );


    // The primary controller for the keyboard layout application.
    // It injects several Angular services and custom services ($scope, $http, $location, $timeout, $sce, $sanitize).
    kbApp.controller( 'kbCtrl', [ '$scope', '$http', '$location', '$timeout', '$sce', '$sanitize',
        function ( $scope, $http, $location, $timeout, $sce, $sanitize ) {

            // Flag to manage a serialization timer, though it's currently unused or commented out.
            var serializedTimer = false;


            // Application version string, displayed in the UI.
            $scope.version = "0.10";


            // Controls the currently selected tab in the user interface.
            // 0: Properties, 1: Kbd Properties, 2: Raw Data.
            $scope.selTab = 0;


            // An array to store references to all currently selected keys.
            $scope.selectedKeys = [ ];


            // An object representing the properties of the most recently selected key.
            // When multiple keys are selected, this object holds common properties or the last key's properties.
            $scope.multi = { };

            // Metadata associated with the entire keyboard layout.
            $scope.meta = { };


            // The main data structure holding the keyboard layout, including an array of keys and global metadata.
            $scope.keyboard = { keys: [ ], meta: { } };

            // A getter/setter function for the keyboard's keys array.
            // If newKeys are provided, it updates the keyboard's keys; otherwise, it returns the current keys.
            $scope.keys = function ( newKeys ) {
                if ( newKeys ) {
                    $scope.keyboard.keys = newKeys;
                }
                return $scope.keyboard.keys;
            };


            /**
             * Clears the current selection of keys.
             * Resets the `selectedKeys` array and the `multi` object.
             */
            $scope.unselectAll = function () {
                $scope.selectedKeys = [ ];
                $scope.multi = { };
            };


            /**
             * Selects all keys currently present in the keyboard layout.
             * Optionally prevents default event behavior if an event object is provided.
             * @param {Event} event - The event object (e.g., from a click).
             */
            $scope.selectAll = function ( event ) {
                if ( event ) {
                    event.preventDefault(); // Prevent default browser actions.
                }

                // Sort keys before selecting them, ensures consistent order.
                $serial.sortKeys( $scope.keys() );

                // Clear any existing selection.
                $scope.unselectAll();

                // Add each key to the selection.
                $scope.keys().forEach( function ( key ) {
                    $scope.selectedKeys.push( key );
                } );

                // If there are keys, set `multi` to a copy of the last selected key.
                if ( $scope.keys().length > 0 ) {
                    $scope.multi = angular.copy( $scope.keys().last() );
                }
            };


            /**
             * Saves the current keyboard layout to the server.
             * @param {Object} layout - The serialized layout data to be saved.
             */
            function saveLayout( layout ) {
                // Use the $serial service to save the layout via HTTP.
                $serial.saveLayout( $http, layout,
                    function ( fn ) { // Success callback
                        // Mark the layout as not dirty and store the saved filename.
                        $scope.dirty = false;
                        $scope.saved = fn;

                        // Update the URL path to reflect the saved layout.
                        $location.path( "/layouts/" + fn );
                        $location.hash( "" ); // Clear any hash.
                        $scope.saveError = ""; // Clear any previous save errors.
                    },
                    function ( data, status ) { // Error callback
                        // Mark as not saved and store the error message.
                        $scope.saved = false;
                        $scope.saveError = status.toString() + " - " + data.toString();
                    }
                );
            }


            /**
             * Initiates the save process for the current keyboard layout.
             * This function is typically triggered by a UI action (e.g., clicking a save button).
             * @param {Event} event - The event object, if applicable.
             */
            $scope.save = function ( event ) {
                if ( event ) {
                    event.preventDefault(); // Prevent default event behavior.
                }

                // Only save if there are unsaved changes.
                if ( $scope.dirty ) {
                    // Serialize the current keyboard state and then call saveLayout.
                    saveLayout( $serial.serialize( $scope.keyboard ) );
                }
            };


            /**
             * Checks if the current layout has unsaved changes.
             * @returns {boolean} True if the layout is dirty, false otherwise.
             */
            $scope.canSave = function () {
                return $scope.dirty;
            };


            /**
             * Handles the selection logic for a single key, including multi-selection
             * with Shift, Ctrl, and Alt modifiers.
             * @param {Object} key - The key object to be selected or deselected.
             * @param {Event} event - The event object (e.g., click event), containing modifier key states.
             */
            function selectKey( key, event ) {

                if ( key ) { // Ensure a key object was provided.

                    // If SHIFT is held down, extend the selection from the last selected key
                    // to the newly clicked key.
                    if ( event.shiftKey && $scope.selectedKeys.length > 0 ) {

                        // Get indices of currently selected keys.
                        var currentSel = $scope.selectedKeys.map( function ( keyItem ) {
                            return $scope.keys().indexOf( keyItem );
                        } );

                        // Sort the indices to find the range.
                        currentSel.sort( function ( a, b ) {
                            return parseInt( a ) - parseInt( b );
                        } );

                        // Determine the cursor (newly clicked key) and anchor (last selected key) positions.
                        var cursor = $scope.keys().indexOf( key );
                        var anchor = $scope.keys().indexOf( $scope.selectedKeys.last() );

                        // Remove the last key from selection to prepare for range selection.
                        $scope.selectedKeys.pop();
                    }


                    // If neither CTRL nor ALT is held down, clear all existing selections
                    // before processing the new selection.
                    if ( !event.ctrlKey && !event.altKey ) {
                        $scope.unselectAll();
                    }


                    // If SHIFT was held, and we have an anchor and cursor,
                    // toggle selection for all keys within that range.
                    if ( anchor !== undefined && cursor !== undefined ) {

                        // Select keys in ascending or descending order based on anchor/cursor positions.
                        if ( anchor > cursor ) {
                            for ( var i = anchor; i >= cursor; --i ) {
                                // Recursively call selectKey with ctrlKey to add to selection.
                                selectKey( $scope.keys()[ i ], { ctrlKey: true } );
                            }
                        } else {
                            for ( var i = anchor; i <= cursor; ++i ) {
                                // Recursively call selectKey with ctrlKey to add to selection.
                                selectKey( $scope.keys()[ i ], { ctrlKey: true } );
                            }
                        }
                        return; // Range selection handled, exit.
                    }


                    // Default behavior: Modify the selection for a single key.
                    var ndx = $scope.selectedKeys.indexOf( key );

                    if ( ndx >= 0 ) { // Key is already selected, so deselect it.
                        $scope.selectedKeys.splice( ndx, 1 ); // Remove key from selected list.

                        if ( $scope.selectedKeys.length < 1 ) {
                            $scope.multi = { }; // If no keys left, clear multi.
                        } else {
                            // Update multi to be the new last selected key.
                            $scope.multi = angular.copy( $scope.selectedKeys.last() );
                        }
                    } else { // Key is not selected, so select it.
                        $scope.selectedKeys.push( key ); // Add key to selected list.
                        $scope.multi = angular.copy( key ); // Update multi to be the newly selected key.
                    }
                }
            };


            // Stores the serialized version of the keyboard layout (pretty-printed).
            $scope.serialized = "";

            // Stores the raw serialized version of the keyboard layout.
            $scope.serializedRaw = "";


            // Objects to store known layouts and sample layouts loaded from JSON.
            $scope.layouts = { };
            $scope.samples = { };

            // Fetch layout data from 'layouts.json' on application startup.
            $http.get( 'layouts.json' ).success( function ( data ) {
                $scope.layouts = data.presets; // Assign presets.
                $scope.samples = data.samples; // Assign samples.
            } );


            // The currently active color palette.
            $scope.palette = { };


            // A collection of available color palettes, loaded from 'colors.json'.
            $scope.palettes = { };

            // Fetch color palette data from 'colors.json' on application startup.
            $http.get( 'colors.json' ).success( function ( data ) {
                $scope.palettes = data; // Store the raw palette data.

                // Process each palette to convert RGB values to CSS hex strings.
                $scope.palettes.forEach( function ( palette ) {
                    palette.colors.forEach( function ( color ) {
                        color.css = $color.sRGB8( color.r, color.g, color.b ).hex();
                    } );
                } );
            } );


            // An object containing definitions for "special" keys, loaded from 'keys.json'.
            $scope.specialKeys = { };

            // Fetch special key definitions from 'keys.json'.
            $http.get( 'keys.json' ).success( function ( data ) {
                $scope.specialKeys = data; // Store the special key data.
            } );


            // Cached height of the entire keyboard layout, initialized to 0.
            // This is used for rendering purposes and updated when key positions change.
            $scope.kbHeight = 0;


            /**
             * Calculates and updates the overall height of the keyboard layout.
             * It finds the maximum bottom-most coordinate among all keys and adds padding.
             */
            $scope.calcKbHeight = function () {
                var bottom = 0; // Initialize bottom edge.

                // Iterate through all keys to find the lowest point.
                $scope.keys().forEach( function ( key ) {
                    bottom = Math.max( bottom, key.bbox.y2 ); // Update bottom if current key is lower.
                } );

                $scope.kbHeight = bottom + 8; // Add some padding to the calculated height.
            };


            // Exposes the key rotation style helper from $renderKey service to the scope.
            $scope.rotationStyle = $renderKey.getKeyRotationStyles;


            /**
             * Renders the HTML representation of a single key.
             * The generated HTML is marked as trusted for Angular's $sce service.
             * @param {Object} key - The key object to render.
             */
            function renderKey( key ) {
                // Generate key HTML using $renderKey service and sanitize it, then trust it.
                key.html = $sce.trustAsHtml( $renderKey.html( key, $sanitize ) );
            }


            /**
             * Deserializes keyboard data and renders all keys.
             * Updates the keyboard object and its metadata on the scope.
             * @param {Array} data - The raw data representing the keyboard layout.
             */
            $scope.deserializeAndRender = function ( data ) {
                // Deserialize the input data into the keyboard object.
                $scope.keyboard = $serial.deserialize( data );

                // Render HTML for each key in the newly deserialized keyboard.
                $scope.keys().forEach( function ( key ) {
                    renderKey( key );
                } );

                // Copy the keyboard's metadata to the scope's meta object.
                $scope.meta = angular.copy( $scope.keyboard.meta );
            };


            /**
             * Updates the serialized string representations of the keyboard layout.
             * This function is called after any changes to the keyboard data.
             */
            function updateSerialized() {
                // The original line to cancel a timer was commented out, possibly due to performance issues.
                // $timeout.cancel(serializedTimer); // this is slow, for some reason

                // Clear any previous deserialization exceptions.
                $scope.deserializeException = "";

                // Serialize the current keyboard state into its raw form.
                $scope.serializedRaw = $serial.serialize( $scope.keyboard );

                // Create a pretty-printed version for display.
                $scope.serialized = toJsonPretty( $scope.serializedRaw );
            }


            // Initial rendering of an empty keyboard.
            $scope.deserializeAndRender( [ ] );


            // Logic for loading a keyboard layout based on the URL hash or path.
            if ( $location.hash() ) {
                var loc = $location.hash(); // Get the URL hash.

                if ( loc[ 0 ] === '@' ) {
                    // If the hash starts with '@', it's URLON-encoded data.
                    $scope.deserializeAndRender( URLON.parse( encodeURI( loc ) ) );
                } else {
                    // Otherwise, it's assumed to be JSON-like data.
                    $scope.deserializeAndRender( $serial.fromJsonL( loc ) );
                }
            } else if ( $location.path()[ 0 ] === '/' ) {
                // If there's a path, try to load a layout from the server.
                $http.get( $serial.base_href + $location.path() ).success( function ( data ) {
                    $scope.deserializeAndRender( data ); // Render the loaded data.
                    updateSerialized(); // Update serialized strings.
                } ).error( function () {
                    $scope.loadError = true; // Set error flag if loading fails.
                } );
            } else {
                // If no hash or path, load a simple default numpad layout.
                $scope.deserializeAndRender( [
                    [ "Num Lock", "/", "*", "-" ],
                    [ "7\nHome", "8\n↑", "9\nPgUp", { h: 2 }, "+" ],
                    [ "4\n←", "5", "6\n→" ],
                    [ "1\nEnd", "2\n↓", "3\nPgDn", { h: 2 }, "Enter" ],
                    [ { w: 2 }, "0\nIns", ".\nDel" ]
                ] );
            }


            // --- Undo/Redo Support ---

            // Stack for storing past states for undo operations.
            var undoStack = [ ];

            // Stack for storing undone states for redo operations.
            var redoStack = [ ];

            // Flag to determine if consecutive operations can be coalesced into a single undo step.
            var canCoalesce = false;


            /**
             * Checks if an undo operation is currently possible.
             * @returns {boolean} True if the undo stack is not empty, false otherwise.
             */
            $scope.canUndo = function () {
                return undoStack.length > 0;
            };


            /**
             * Checks if a redo operation is currently possible.
             * @returns {boolean} True if the redo stack is not empty, false otherwise.
             */
            $scope.canRedo = function () {
                return redoStack.length > 0;
            };


            // Flag indicating if there are unsaved changes.
            $scope.dirty = false;

            // Flag indicating if the layout has been saved.
            $scope.saved = false;

            // Stores any error message from a save operation.
            $scope.saveError = "";


            // Browser event handler for when the user tries to navigate away or close the tab.
            // It prompts the user if there are unsaved changes.
            window.onbeforeunload = function ( e ) {
                return $scope.dirty ? 'You have made changes to the layout that are not saved.  You can save your layout to the server by clicking the \'Save\' button.  You can also save your layout locally by bookmarking the \'Permalink\' in the application bar.' : null;
            };


            /**
             * Manages state changes for undo/redo functionality.
             * Each modification to the keyboard layout should be wrapped in a transaction.
             * @param {string} type - A descriptive type for the transaction (e.g., "update", "move").
             * @param {Function} fn - The function containing the actual modification logic.
             */
            function transaction( type, fn ) {

                // Get the last transaction if it exists, for potential coalescing.
                var trans = undoStack.length > 0 ? undoStack.last() : null;

                // If no previous transaction, or if coalescing is not allowed, or if the type differs,
                // create a new transaction entry.
                if ( trans === null || !canCoalesce || trans.type !== type ) {
                    trans = { type: type, original: angular.copy( $scope.keyboard ), open: true, dirty: $scope.dirty };
                    undoStack.push( trans );

                    // Limit the size of the undo stack to prevent excessive memory usage.
                    if ( undoStack.length > 32 ) {
                        undoStack.shift(); // Remove the oldest entry.
                    }
                }

                canCoalesce = true; // Allow subsequent operations to coalesce into this transaction.

                try {
                    fn(); // Execute the actual modification function.
                } finally {
                    // Clear location hash and path after a transaction to ensure clean state.
                    if ( $location.hash() ) {
                        $location.hash( "" );
                    }
                    if ( $location.path() ) {
                        $location.path( "" );
                    }

                    // Store the modified state of the keyboard.
                    trans.modified = angular.copy( $scope.keyboard );
                    trans.open = false; // Mark transaction as closed.
                    redoStack = [ ]; // Clear the redo stack after a new transaction.

                    // Update serialized data unless it's a 'rawdata' transaction (which handles its own serialization).
                    if ( type !== 'rawdata' ) {
                        updateSerialized();
                    }

                    // Mark the layout as dirty and clear save/load related messages.
                    $scope.dirty = true;
                    $scope.saved = false;
                    $scope.saveError = "";
                    $scope.loadError = false;
                }
            }


            /**
             * Performs an undo operation, reverting the keyboard layout to a previous state.
             */
            $scope.undo = function () {
                if ( $scope.canUndo() ) { // Only proceed if undo is possible.
                    var u = undoStack.pop(); // Get the last undo entry.
                    $scope.keyboard = angular.copy( u.original ); // Revert to the original state.
                    updateSerialized(); // Update serialized strings.

                    // Re-render all keys for the reverted layout.
                    $scope.keys().forEach( function ( key ) {
                        renderKey( key );
                    } );

                    redoStack.push( u ); // Push the undone state to the redo stack.
                    $scope.dirty = u.dirty; // Restore the dirty state from before the transaction.
                    $scope.unselectAll(); // Clear current key selections.
                    $scope.meta = $scope.keyboard.meta; // Update metadata.
                }
            };


            /**
             * Performs a redo operation, reapplying a previously undone state.
             */
            $scope.redo = function () {
                if ( $scope.canRedo() ) { // Only proceed if redo is possible.
                    var u = redoStack.pop(); // Get the last redo entry.
                    $scope.keyboard = angular.copy( u.modified ); // Apply the modified state.
                    updateSerialized(); // Update serialized strings.

                    // Re-render all keys for the redone layout.
                    $scope.keys().forEach( function ( key ) {
                        renderKey( key );
                    } );

                    undoStack.push( u ); // Push the redone state back to the undo stack.
                    $scope.dirty = true; // Mark as dirty since changes were reapplied.
                    $scope.unselectAll(); // Clear current key selections.
                    $scope.meta = $scope.keyboard.meta; // Update metadata.
                }
            };


            /**
             * Validates a given property value against predefined constraints for a key.
             * Ensures values stay within reasonable bounds.
             * @param {Object} key - The key object being validated.
             * @param {string} prop - The name of the property to validate.
             * @param {*} value - The value to validate.
             * @returns {*} The validated and potentially clamped value.
             */
            function validate( key, prop, value ) {
                var v = {
                    _ : function () {
                        return value;
                    }, // Default: return value as is.
                    x : function () {
                        return Math.max( 0, Math.min( 36, value ) );
                    },
                    y : function () {
                        return Math.max( 0, Math.min( 36, value ) );
                    },
                    x2 : function () {
                        return Math.max( -Math.abs( key.width - key.width2 ), Math.min( Math.abs( key.width - key.width2 ), value ) );
                    },
                    y2 : function () {
                        return Math.max( -Math.abs( key.height - key.height2 ), Math.min( Math.abs( key.height - key.height2 ), value ) );
                    },
                    width : function () {
                        return Math.max( 0.5, Math.min( 12, value ) );
                    },
                    height : function () {
                        return Math.max( 0.5, Math.min( 12, value ) );
                    },
                    width2 : function () {
                        return Math.max( 0.5, Math.min( 12, value ) );
                    },
                    height2 : function () {
                        return Math.max( 0.5, Math.min( 12, value ) );
                    },
                    fontheight : function () {
                        return Math.max( 1, Math.min( 9, value ) );
                    },
                    fontheight2 : function () {
                        return Math.max( 1, Math.min( 9, value ) );
                    },
                    rotation_angle : function () {
                        return Math.max( -180, Math.min( 180, value ) );
                    },
                    rotation_x : function () {
                        return Math.max( 0, Math.min( 36, value ) );
                    },
                    rotation_y : function () {
                        return Math.max( 0, Math.min( 36, value ) );
                    },
                };
                // Call the specific validator for the property, or the default if none exists.
                return ( v[ prop ] || v._ )();
            }


            /**
             * Updates a specific property of a key, potentially with side effects
             * or special handling for certain properties (e.g., width, height, alignment).
             * @param {Object} key - The key object to update.
             * @param {string} prop - The name of the property to update.
             * @param {*} value - The new value for the property.
             */
            function update( key, prop, value ) {
                var u = {
                    _ : function () {
                        key[ prop ] = value;
                    }, // Default: assign value directly.
                    width : function () {
                        key.width = value;
                        // If not stepped or if new width is greater, update width2 as well.
                        if ( !key.stepped || key.width > key.width2 ) {
                            key.width2 = value;
                        }
                    },
                    height : function () {
                        key.height = value;
                        // If not stepped or if new height is greater, update height2 as well.
                        if ( !key.stepped || key.height > key.height2 ) {
                            key.height2 = value;
                        }
                    },
                    centerx : function () {
                        // Toggle the 1st bit of the 'align' property for horizontal centering.
                        if ( value ) {
                            key.align = key.align | 1;
                        } else {
                            key.align = key.align & ( ~1 );
                        }
                    },
                    centery : function () {
                        // Toggle the 2nd bit of the 'align' property for vertical centering.
                        if ( value ) {
                            key.align = key.align | 2;
                        } else {
                            key.align = key.align & ( ~2 );
                        }
                    },
                    centerf : function () {
                        // Toggle the 3rd bit of the 'align' property for font centering.
                        if ( value ) {
                            key.align = key.align | 4;
                        } else {
                            key.align = key.align & ( ~4 );
                        }
                    },
                    fontheight : function () {
                        // Update both fontheight and fontheight2 simultaneously.
                        key.fontheight = key.fontheight2 = value;
                    },
                    stepped : function () {
                        key[ prop ] = value; // Assign the stepped property.
                        // Adjust width/width2 if stepped is enabled and they are currently equal.
                        if ( value && key.width === key.width2 ) {
                            if ( key.width > 1 ) {
                                key.width = Math.max( 1, key.width - 0.5 );
                            } else {
                                key.width2 = key.width + 0.5;
                            }
                        }
                    },
                    rotation_angle : function () {
                        key.rotation_angle = value;
                        // When angle changes, also update rotation pivot points from $scope.multi.
                        key.rotation_x = $scope.multi.rotation_x;
                        key.rotation_y = $scope.multi.rotation_y;
                    },
                };
                // Call the specific updater for the property, or the default if none exists.
                return ( u[ prop ] || u._ )();
            }


            /**
             * Updates a property for all currently selected keys based on the value in `$scope.multi`.
             * This function is typically triggered by changes in the "multi-key properties" editor.
             * @param {string} prop - The name of the property to update.
             */
            $scope.updateMulti = function ( prop ) {

                // Do nothing if the property is null or no keys are selected.
                if ( $scope.multi[ prop ] == null || $scope.selectedKeys.length <= 0 ) {
                    return;
                }

                // Validate the property value from $scope.multi.
                var valid = validate( $scope.multi, prop, $scope.multi[ prop ] );

                // If the value is not valid, return without applying changes.
                if ( valid !== $scope.multi[ prop ] ) {
                    return;
                }

                // Wrap the updates in a transaction for undo/redo.
                transaction( "update", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        update( selectedKey, prop, $scope.multi[ prop ] ); // Apply the update.
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // After updating, refresh $scope.multi to reflect the last selected key's state.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );
            };


            /**
             * Validates and potentially corrects a property value in `$scope.multi`.
             * If the value is invalid, it's clamped and then `updateMulti` is called.
             * @param {string} prop - The name of the property to validate.
             */
            $scope.validateMulti = function ( prop ) {

                // If the property is null, initialize it to an empty string.
                if ( $scope.multi[ prop ] == null ) {
                    $scope.multi[ prop ] = "";
                }

                // Validate the current value.
                var valid = validate( $scope.multi, prop, $scope.multi[ prop ] );

                // If the value changed after validation (i.e., it was clamped).
                if ( valid !== $scope.multi[ prop ] ) {
                    $scope.multi[ prop ] = valid; // Update $scope.multi with the valid value.
                    $scope.updateMulti( prop ); // Trigger an update for all selected keys.
                }
            };


            /**
             * Updates a metadata property of the keyboard layout.
             * @param {string} prop - The name of the metadata property to update.
             */
            $scope.updateMeta = function ( prop ) {
                // Wrap the metadata update in a transaction.
                transaction( "metadata", function () {
                    $scope.keyboard.meta[ prop ] = $scope.meta[ prop ]; // Assign the new metadata value.
                } );
            };


            /**
             * Placeholder for metadata validation logic. Currently does nothing.
             * @param {string} prop - The name of the metadata property to validate.
             */
            $scope.validateMeta = function ( prop ) {
                // No validation logic implemented yet for metadata.
            };


            // Initial call to update serialized data when the application starts.
            updateSerialized();


            /**
             * Swaps the primary color (background) and text color for all selected keys.
             */
            $scope.swapColors = function () {
                transaction( "swapColors", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        var temp = selectedKey.color; // Store the current background color.
                        selectedKey.color = selectedKey.text; // Set background color to text color.
                        selectedKey.text = temp; // Set text color to original background color.
                        renderKey( selectedKey ); // Re-render the key with new colors.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );
            };


            /**
             * Applies a selected color swatch to keys.
             * If Ctrl/Alt is held, it applies to text color; otherwise, to background color.
             * @param {Object} color - The color object from the palette.
             * @param {Event} $event - The click event object.
             */
            $scope.clickSwatch = function ( color, $event ) {
                $event.preventDefault(); // Prevent default browser action (e.g., selection).

                // If no keys are selected, do nothing.
                if ( $scope.selectedKeys.length < 1 ) {
                    return;
                }

                transaction( "color-swatch", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        if ( $event.ctrlKey || $event.altKey ) {
                            selectedKey.text = color.css; // Apply to text color if modifier key is pressed.
                        } else {
                            selectedKey.color = color.css; // Apply to background color by default.
                        }
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );
            };


            /**
             * Moves all selected keys by a given offset (x, y).
             * Prevents keys from being moved off the top or left edge.
             * @param {number} x - Horizontal movement offset.
             * @param {number} y - Vertical movement offset.
             * @param {Event} $event - The event object.
             */
            $scope.moveKeys = function ( x, y, $event ) {
                $event.preventDefault(); // Prevent default browser action.

                // If no keys are selected, do nothing.
                if ( $scope.selectedKeys.length < 1 ) {
                    return;
                }

                // Check if moving keys would result in any key going off the left or top edge.
                if ( x < 0 || y < 0 ) {
                    var canMoveKeys = true;
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        if ( selectedKey.x + x < 0 ||
                            selectedKey.y + y < 0 ||
                            selectedKey.x + selectedKey.x2 + x < 0 ||
                            selectedKey.y + selectedKey.y2 + y < 0 ) {
                            canMoveKeys = false; // Cannot move if any key goes negative.
                        }
                    } );
                    if ( !canMoveKeys ) {
                        return; // Abort if any key would move out of bounds.
                    }
                }

                transaction( "move", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        // Apply movement, ensuring coordinates don't go below 0.
                        selectedKey.x = Math.max( 0, selectedKey.x + x );
                        selectedKey.y = Math.max( 0, selectedKey.y + y );
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );

                // If vertical movement occurred, recalculate keyboard height.
                if ( y !== 0 ) {
                    $scope.calcKbHeight();
                }
            };


            /**
             * Resizes all selected keys by a given amount (x for width, y for height).
             * Ensures keys maintain a minimum size.
             * @param {number} x - Horizontal size adjustment.
             * @param {number} y - Vertical size adjustment.
             * @param {Event} $event - The event object.
             */
            $scope.sizeKeys = function ( x, y, $event ) {
                $event.preventDefault(); // Prevent default browser action.

                // If no keys are selected, do nothing.
                if ( $scope.selectedKeys.length < 1 ) {
                    return;
                }

                transaction( "size", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        // Update width and height, ensuring a minimum size of 1.
                        update( selectedKey, 'width', Math.max( 1, selectedKey.width + x ) );
                        update( selectedKey, 'height', Math.max( 1, selectedKey.height + y ) );
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );

                // If vertical resizing occurred, recalculate keyboard height.
                if ( y !== 0 ) {
                    $scope.calcKbHeight();
                }
            };


            /**
             * Rotates all selected keys by a given angle.
             * @param {number} angle - The angle in degrees to rotate by.
             * @param {Event} $event - The event object.
             */
            $scope.rotateKeys = function ( angle, $event ) {
                $event.preventDefault(); // Prevent default browser action.

                // If no keys are selected, do nothing.
                if ( $scope.selectedKeys.length < 1 ) {
                    return;
                }

                transaction( "rotate", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        var newangle = ( selectedKey.rotation_angle + angle + 360 ) % 360; // Calculate new angle, wrap around 360.
                        while ( newangle > 180 ) {
                            newangle -= 360;
                        } // Normalize angle to -180 to 180 range.
                        update( selectedKey, 'rotation_angle', newangle ); // Apply the new angle.
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );

                $scope.calcKbHeight(); // Recalculate keyboard height after rotation.
            };


            /**
             * Moves the rotation center of all selected keys.
             * @param {number} x - Horizontal movement for the rotation center.
             * @param {number} y - Vertical movement for the rotation center.
             * @param {Event} $event - The event object.
             */
            $scope.moveCenterKeys = function ( x, y, $event ) {
                $event.preventDefault(); // Prevent default browser action.

                // If no keys are selected, do nothing.
                if ( $scope.selectedKeys.length < 1 ) {
                    return;
                }

                transaction( "moveCenter", function () {
                    $scope.selectedKeys.forEach( function ( selectedKey ) {
                        // Update rotation_x and rotation_y based on current $scope.multi values and offsets.
                        update( selectedKey, 'rotation_x', validate( selectedKey, 'rotation_x', $scope.multi.rotation_x + x ) );
                        update( selectedKey, 'rotation_y', validate( selectedKey, 'rotation_y', $scope.multi.rotation_y + y ) );
                        renderKey( selectedKey ); // Re-render the key.
                    } );
                    // Update multi-selection object.
                    $scope.multi = angular.copy( $scope.selectedKeys.last() );
                } );

                $scope.calcKbHeight(); // Recalculate keyboard height.
            };


            /**
             * Sets the currently active color palette.
             * @param {Object} p - The palette object to load.
             */
            $scope.loadPalette = function ( p ) {
                $scope.palette = p; // Assign the selected palette.
            };


            /**
             * Retrieves the name of a color from the current palette based on its CSS value.
             * @param {string} color - The CSS color string (e.g., "#RRGGBB").
             * @returns {string} The name of the color, or an empty string if not found.
             */
            $scope.colorName = function ( color ) {
                if ( color && $scope.palette.colors ) {
                    // Iterate through colors in the palette to find a match.
                    for ( var i = 0; i < $scope.palette.colors.length; i++ ) {
                        if ( $scope.palette.colors[ i ].css === color ) {
                            return $scope.palette.colors[ i ].name; // Return the color name.
                        }
                    }
                }
                return ""; // Return empty string if color not found or palette is not set.
            };


            /**
             * Loads a predefined keyboard layout preset.
             * @param {Array} preset - The raw data for the preset layout.
             */
            $scope.loadPreset = function ( preset ) {
                transaction( "preset", function () {
                    $scope.deserializeAndRender( preset ); // Deserialize and render the preset.
                } );
                $scope.dirty = false; // Mark the layout as not dirty after loading a preset.
            };

        }
    ] ); // End of kbCtrl controller definition.

} )(); // End of IIFE.