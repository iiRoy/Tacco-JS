/*
 * Column Reordering Module - Version 1.0.0
 * Based on original work by Aleksandr Nikitin
 * Refactored for enhanced flexibility and maintainability.
 *
 * This module enables drag-and-drop functionality for table headers,
 * allowing users to dynamically reorder columns.
 */
(function(jqAlias, currentWindow) {

    // Ensure jQuery is available before proceeding
    if (typeof jqAlias === 'undefined') {
        currentWindow.console && currentWindow.console.warn('ColumnReorderer: jQuery not found. Plugin will not initialize.');
        return;
    }

    // Module-level state variables for tracking drag operations
    let headerCells;             // Collection of draggable table header cells
    let activeDragSource = null; // The header cell currently being dragged
    let currentDropTarget = null;  // The header cell over which the activeDragSource is currently hovering
    let isDragOperationActive = false; // Flag to indicate if a drag operation is in progress

    /**
     * Inserts a DOM element immediately after another specified DOM element.
     * @param {HTMLElement} elementToInsert - The element to be inserted.
     * @param {HTMLElement} referenceElement - The element after which elementToInsert will be placed.
     * @returns {HTMLElement} The inserted element.
     */
    function placeElementAfter(elementToInsert, referenceElement) {
        if (!referenceElement || !referenceElement.parentNode) {
            console.warn('ColumnReorderer: Invalid reference element for insertion.');
            return elementToInsert;
        }
        return referenceElement.parentNode.insertBefore(elementToInsert, referenceElement.nextSibling);
    }

    /**
     * Checks if the current browser is an older version of Internet Explorer (specifically IE9).
     * @returns {number|boolean} The IE version number if detected, otherwise false.
     */
    function checkLegacyBrowser() {
        const userAgentString = currentWindow.navigator.userAgent.toLowerCase();
        const msieIndex = userAgentString.indexOf('msie');
        if (msieIndex !== -1) {
            const versionPart = userAgentString.split('msie')[1];
            return parseInt(versionPart, 10);
        }
        return false;
    }

    /**
     * The core module for managing column reordering.
     * @namespace columnReorderer
     */
    const columnReorderer = (function() {
        let jqTableRef; // Reference to the jQuery wrapped table element
        let selfRef;     // Reference to the instance of this class

        /**
         * Constructor for the column reorderer.
         * @param {jQuery} domTableElement - The jQuery object representing the table.
         * @param {object} userConfig - Configuration options for the reorderer.
         */
        function initColumnReorder(domTableElement, userConfig) {
            selfRef = this; // Store instance reference
            jqTableRef = domTableElement; // Store jQuery table reference

            // Merge default configuration with user-provided options
            selfRef.configSettings = Object.assign({}, selfRef.configSettings, userConfig);

            // Basic validation for core settings
            if (typeof selfRef.configSettings.enableDrag !== 'boolean') {
                console.warn('ColumnReorderer: "enableDrag" setting should be a boolean. Defaulting to true.');
                selfRef.configSettings.enableDrag = true;
            }

            // If drag functionality is enabled, proceed with setup
            if (selfRef.configSettings.enableDrag) {
                // Special handling for IE9 to make draggable elements clickable
                const ieVersion = checkLegacyBrowser();
                if (ieVersion === 9) {
                    jqTableRef.find('thead tr th').each(function() {
                        const currentHeader = jqAlias(this);
                        // Only wrap if not already wrapped
                        if (currentHeader.find('.legacy-drag-fix').length === 0) {
                            const originalContent = currentHeader.html();
                            const wrapperAnchor = jqAlias('<a>')
                                .html(originalContent)
                                .attr('href', '#') // Prevent navigation
                                .addClass('legacy-drag-fix'); // Add a specific class for styling/identification
                            currentHeader.html(wrapperAnchor); // Replace content with wrapped version
                        }
                    });
                }

                // Identify all header cells that can be dragged
                headerCells = jqTableRef.find('thead tr th').get(); // Get raw DOM elements

                // Ensure dataTransfer property is available on events for older jQuery versions
                if (!jqAlias.event.props || jqAlias.inArray('dataTransfer', jqAlias.event.props) === -1) {
                    jqAlias.event.props.push('dataTransfer');
                }

                // Attach drag-and-drop event listeners to each header cell
                Array.from(headerCells).forEach(function(colElement) {
                    colElement.setAttribute('draggable', true); // Make the element natively draggable

                    jqAlias(colElement).on({
                        'dragstart': selfRef.onDragInitiated,
                        'dragenter': selfRef.onDragEntered,
                        'dragover': selfRef.onDragHovered,
                        'dragleave': selfRef.onDragExited,
                        'drop': selfRef.onDropPerformed,
                        'dragend': selfRef.onDragFinished
                    });
                });
            }
        }

        /**
         * Prototype methods for the column reorderer.
         * @lends columnReorderer.prototype
         */
        initColumnReorder.prototype = {
            /**
             * Default configuration settings.
             */
            configSettings: {
                enableDrag: true,         // Whether drag functionality is active
                draggingClass: 'is-dragging', // CSS class for the element being dragged
                hoveringClass: 'is-hovering', // CSS class for the element being hovered over
                affectedSelector: '.dnd-target-row', // Selector for rows whose cells should be reordered
                animationDuration: 200    // Duration for any potential future animations (ms)
            },

            /**
             * Handles the start of a drag operation.
             * @param {Event} eventObject - The dragstart event.
             */
            onDragInitiated: function(eventObject) {
                jqAlias(this).addClass(selfRef.configSettings.draggingClass);
                activeDragSource = this; // Store the element that started the drag

                isDragOperationActive = true; // Mark drag as active

                // Set allowed drag effects and data to transfer
                if (eventObject.dataTransfer) {
                    eventObject.dataTransfer.effectAllowed = 'copyMove'; // Allow both copy and move
                    eventObject.dataTransfer.setData('text/plain', 'dnd-column-id:' + this.id); // Set some data
                } else {
                    console.warn('ColumnReorderer: dataTransfer not available on dragstart event.');
                }
            },

            /**
             * Handles the 'dragover' event, allowing a drop to occur.
             * @param {Event} eventObject - The dragover event.
             * @returns {boolean} False to prevent default behavior.
             */
            onDragHovered: function(eventObject) {
                if (eventObject.preventDefault) {
                    eventObject.preventDefault(); // Necessary to allow a drop
                }
                if (eventObject.dataTransfer) {
                    eventObject.dataTransfer.dropEffect = 'move'; // Indicate a move operation
                }
                return false; // Suppress default browser actions
            },

            /**
             * Handles the 'dragenter' event, when a draggable element enters a drop target.
             * @param {Event} eventObject - The dragenter event.
             * @returns {boolean} False to prevent default behavior.
             */
            onDragEntered: function(eventObject) {
                currentDropTarget = this; // Update the current target being hovered over

                // Clear 'hoveringClass' from all headers before applying to the current target
                Array.from(headerCells).forEach(function(col) {
                    jqAlias(col).removeClass(selfRef.configSettings.hoveringClass);
                });

                // Apply 'hoveringClass' to the current target, but only if it's not the source itself
                if (this !== activeDragSource) {
                    jqAlias(this).addClass(selfRef.configSettings.hoveringClass);
                    // console.log('Column entered: ' + jqAlias(this).text().trim()); // Debugging
                }
                return false;
            },

            /**
             * Handles the 'dragleave' event, when a draggable element leaves a drop target.
             * @param {Event} eventObject - The dragleave event.
             */
            onDragExited: function(eventObject) {
                // If a drag operation is active and the element is not the current drop target,
                // remove the hovering class. This helps prevent flicker if leaving quickly.
                if (isDragOperationActive && this !== currentDropTarget) {
                    // jqAlias(this).removeClass(selfRef.configSettings.hoveringClass); // Removed as dragenter already clears all
                }
            },

            /**
             * Handles the 'drop' event, when the draggable element is dropped on a target.
             * @param {Event} eventObject - The drop event.
             * @returns {boolean} False to prevent default behavior.
             */
            onDropPerformed: function(eventObject) {
                if (eventObject.stopPropagation) {
                    eventObject.stopPropagation(); // Stop propagation to prevent browser default drop handling
                }

                // Only perform the move if the source and target are different
                if (activeDragSource && activeDragSource !== this) {
                    const sourceIndex = jqAlias(activeDragSource).index();
                    const destinationIndex = jqAlias(this).index();

                    // Perform the actual column reordering
                    selfRef.repositionColumns(sourceIndex, destinationIndex);
                }
                return false;
            },

            /**
             * Handles the 'dragend' event, when the drag operation finishes (drop or cancel).
             * @param {Event} eventObject - The dragend event.
             * @returns {boolean} False to prevent default behavior.
             */
            onDragFinished: function(eventObject) {
                // Clean up all visual feedback classes
                Array.from(headerCells).forEach(function(col) {
                    jqAlias(col).removeClass(selfRef.configSettings.hoveringClass);
                });
                if (activeDragSource) {
                    jqAlias(activeDragSource).removeClass(selfRef.configSettings.draggingClass);
                }

                // Reset module-level state variables
                activeDragSource = null;
                currentDropTarget = null;
                isDragOperationActive = false;
                return false;
            },

            /**
             * Moves columns within the table from a source index to a destination index.
             * This involves moving both header cells and corresponding data cells in each row.
             * @param {number} sourceIdx - The original index of the column to move.
             * @param {number} destinationIdx - The target index where the column should be moved.
             */
            repositionColumns: function(sourceIdx, destinationIdx) {
                // Basic validation for indices
                if (sourceIdx < 0 || destinationIdx < 0 || sourceIdx >= headerCells.length || destinationIdx >= headerCells.length) {
                    console.warn('ColumnReorderer: Invalid column indices provided for repositioning.');
                    return;
                }

                // Get all rows that contain draggable content (header, body, footer)
                const affectedRowElements = jqTableRef.find('thead tr, ' + selfRef.configSettings.affectedSelector).get();

                Array.from(affectedRowElements).forEach(function(currentRow) {
                    const childrenOfRow = currentRow.children; // Get all cells (th/td) in the current row
                    const columnToMove = childrenOfRow[sourceIdx];

                    // Ensure the column to move exists
                    if (!columnToMove) {
                        console.warn('ColumnReorderer: Column to move not found at index', sourceIdx, 'in row', currentRow);
                        return;
                    }

                    // Determine the reference element for insertion
                    let referenceElement = childrenOfRow[destinationIdx];

                    // Logic for moving:
                    // If moving to the right (destination index is greater)
                    if (destinationIdx > sourceIdx) {
                        // Insert the column after the target column
                        if (referenceElement) {
                            placeElementAfter(columnToMove, referenceElement);
                        } else { // Should not happen if indices are valid, but as a fallback
                             currentRow.appendChild(columnToMove);
                        }
                    }
                    // If moving to the left (destination index is smaller)
                    else if (destinationIdx < sourceIdx) {
                        // Insert the column before the target column
                        if (referenceElement) {
                            currentRow.insertBefore(columnToMove, referenceElement);
                        } else { // Should not happen
                            currentRow.prepend(columnToMove);
                        }
                    }
                    // If sourceIdx === destinationIdx, no move is needed.
                });

                // Re-cache header cells after DOM manipulation as their order has changed
                headerCells = jqTableRef.find('thead tr th').get();
            }
        };

        return initColumnReorder; // Return the constructor function
    })(); // End of columnReorderer IIFE

    /**
     * jQuery plugin definition for column reordering.
     * @param {object} [initConfiguration] - Optional configuration settings.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jqAlias.fn.extend({
        initColumnReorderer: function(initConfiguration) {
            // Iterate over each selected table element
            return this.each(function(idx, element) {
                const targetJQueryElement = jqAlias(element);

                // Check if the element is actually a table
                if (!targetJQueryElement.is('table')) {
                    console.warn('ColumnReorderer: Selector must target a <table> element. Skipping non-table element:', element);
                    return;
                }

                // Create a new instance of the column reorderer for each table
                new columnReorderer(targetJQueryElement, initConfiguration);
            });
        }
    });

})(window.jQuery, window);