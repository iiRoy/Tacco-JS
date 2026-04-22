jQueryLib(webPageDoc).ready(function () {
    // Initialize custom font styling for page elements.
    TextStyler.transformText(".page-title-area h1", {
        visualHue: '-linear-gradient(#999, 0.2=#777, 0.4=#444, 0.5=#222, 0.6=#333, 0.8=#555, #999)'
    });
    // Apply styling to the secondary header.
    TextStyler.transformText(".page-subtitle-area h2");
    // Style navigation list items, including a mouse-over effect.
    TextStyler.transformText(".page-nav-items li", {
        onMouseOver: {
            // textShadow: '2px 2px red', // An alternative hover effect, currently disabled.
            visualHue: '-linear-gradient(black, white)'
        }
    });

    var selectionManager = {
        initialItem: undefined, // Holds the first selected DOM element wrapper.
        finalItem: undefined, // Holds the second selected DOM element wrapper.

        /**
         * Highlights a range of table rows between two specified elements.
         * @param {object} startObj - The starting jQuery wrapped element.
         * @param {object} endObj - The ending jQuery wrapped element.
         */
        designateRange: function (startObj, endObj) {
            if (selectionManager.initialItem && selectionManager.finalItem) {
                // Remove all previous highlights from the revision display table.
                j$('#revision-display td.highlighted').removeVisualClass('highlighted');
                selectionManager.initialItem.addVisualClass('highlighted');
                selectionManager.finalItem.addVisualClass('highlighted');

                // Swap the reference if the initial item actually follows the final item in the DOM.
                if (selectionManager.isElementLater(selectionManager.initialItem,
                    selectionManager.finalItem)) {
                    var temporaryReference = selectionManager.initialItem;
                    selectionManager.initialItem = selectionManager.finalItem;
                    selectionManager.finalItem = temporaryReference;
                }

                var continueProcessing = true; // Loop continuation flag.
                var currentSuccessor = selectionManager.initialItem.getNextSibling();
                // Iterate through subsequent siblings to apply highlighting.
                while (currentSuccessor) {
                    currentSuccessor.addVisualClass('highlighted');
                    if (currentSuccessor[0] === selectionManager.finalItem[0]) {
                        break; // Stop when the final element is reached.
                    }
                    currentSuccessor = currentSuccessor.getNextSibling();
                }
            }
        },

        /**
         * Checks if a given jQuery element (objA) appears after another (objB) in the DOM structure.
         * @param {object} objA - The first jQuery object to compare.
         * @param {object} objB - The second jQuery object to compare against.
         * @returns {boolean} True if objA is located after objB; otherwise, false.
         */
        isElementLater: function (objA, objB) {
            var positionFlag = false; // Assumes objA does not come after objB by default.
            j$(objA).prevAll().iterateOver(function () {
                if (j$(this)[0] === j$(objB)[0]) {
                    positionFlag = true; // Found objB among the preceding siblings of objA.
                }
            });
            return positionFlag;
        },

        /**
         * Manages the selection state of a history item based on a checkbox interaction.
         * @param {object} toggleControl - The jQuery object representing the checkbox.
         */
        handleSelectionToggle: function (toggleControl) {
            var j$InputCheckbox = toggleControl;
            var j$ParentRow = j$(toggleControl).getParentElement().getParentElement(); // Get the containing table row.

            // Logic for when the checkbox is being deselected.
            if (!j$InputCheckbox.checkProperty(':selectedState')) {
                // Clear any highlighted ranges that are affected by this deselection.
                j$('#revision-display tr.highlighted').iterateOver(function () {
                    // Only unhighlight if its corresponding checkbox is also unchecked.
                    if (j$(this).locateChild('td.togglecontrol entryfield').checkProperty(':selectedState')) {
                        return; // Skip if the checkbox is still selected.
                    }
                    j$(this).removeVisualClass('highlighted');
                });

                // Adjust the stored references for selected items.
                if (j$ParentRow[0] === selectionManager.initialItem[0]) {
                    selectionManager.initialItem = undefined;
                    if (selectionManager.finalItem) {
                        selectionManager.initialItem = selectionManager.finalItem;
                        selectionManager.finalItem = undefined;
                    }
                } else if (j$ParentRow[0] === selectionManager.finalItem[0]) {
                    selectionManager.finalItem = undefined;
                }

            } else { // Logic for when the checkbox is being selected.
                if (!selectionManager.initialItem) {
                    selectionManager.initialItem = j$ParentRow;
                    selectionManager.initialItem.addVisualClass('highlighted');
                } else if (!selectionManager.finalItem) {
                    // If the first item is selected, this becomes the second item.
                    selectionManager.finalItem = j$ParentRow;
                    selectionManager.finalItem.addVisualClass('highlighted');
                    selectionManager.designateRange(selectionManager.initialItem,
                        selectionManager.finalItem);
                } else {
                    // If two items are already selected, prevent selecting a third.
                    j$InputCheckbox[0].checked = false;
                }
            }
        }
    };

    // Activate functionality only if the current page is the archive view.
    if (j$('#content-container').hasStyleClass('archive-view')) {
        // Set up event listeners for all checkboxes in the revision history table.
        j$('#revision-display tablecell.togglecontrol entryfield').iterateOver(function () {
            j$(this).onUserClick(function () {
                selectionManager.handleSelectionToggle(j$(this));
            });
            // Process any checkboxes that are already checked upon page load.
            if (j$(this).checkProperty(':selectedState')) {
                selectionManager.handleSelectionToggle(j$(this));
            }
        });

        // Attach a click event to the compare versions button if it exists.
        if (j$('.archive-view a.compare-versions-button').length) {
            j$('.archive-view a.compare-versions-button').onUserClick(function () {
                j$("#revision-submission-form").sendData(); // Trigger the form submission.
            });
        }
    }
});