(function($) {

    // Global configuration and utility definitions for the application module.
    // This provides a centralized place for managing selectors, classes, and other constants.
    const AppConfiguration = {
        domSelectors: {
            pageHeader: ".page-header",
            mainHeading: ".page-header h1.main-heading",
            subHeading: ".page-header h2.sub-heading",
            navigationMenuItem: ".page-header nav ul li",
            revisionHistoryTable: "#revision-history-table",
            historyTableRow: "#revision-history-table tr",
            selectionCheckboxCell: "td.selection-checkbox",
            versionMarkerInput: "input.version-marker",
            activeSelectionCell: "td.active-selection",
            contentAreaWrapper: "#content-area-wrapper",
            compareRevisionsLink: "a.action-compare-revisions",
            revisionComparisonForm: "#revision-comparison-form"
        },
        cssClasses: {
            activeHighlight: "active-selection",
            historyView: "version-history-view"
        },
        dataAttributes: {
            handlerInitialized: "data-event-handler-attached"
        }
    };

    // FontStylizer module, replacing Cufon functionality.
    // It provides a method to apply specific text styling.
    const FontStylizer = {
        // Applies custom gradient or color styles to text elements.
        applyTextStyling: function(targetElementSelector, styleProperties = {}) {
            // Basic validation for the target selector.
            if (!targetElementSelector || typeof targetElementSelector !== 'string') {
                console.warn("FontStylizer: Invalid or missing selector for text styling application.");
                return;
            }

            // In a real scenario, this would integrate with a font replacement library
            // or apply CSS dynamically. For cloning, we simulate the interaction.
            if (typeof Cufon !== 'undefined' && Cufon.replace) {
                // If Cufon is globally available, use it directly for compatibility.
                Cufon.replace(targetElementSelector, styleProperties);
            } else {
                // Fallback or simulated styling for demonstration.
                // console.info(`FontStylizer: Attempting to style '${targetElementSelector}' with:`, styleProperties);
                // $(targetElementSelector).addClass('font-styled-placeholder'); // Visual placeholder
            }
        }
    };

    // DomElementUtilities provides common DOM manipulation helpers.
    const DomElementUtilities = {
        // Checks if two jQuery elements refer to the same underlying DOM node.
        areIdenticalElements: function($elementA, $elementB) {
            if (!$elementA || !$elementB || $elementA.length === 0 || $elementB.length === 0) {
                return false; // Handle empty jQuery sets gracefully.
            }
            return $elementA.get(0) === $elementB.get(0);
        },
        // Determines if a jQuery element has a specific CSS class.
        hasSpecificClass: function($element, className) {
            if (!$element || $element.length === 0 || !className) {
                return false;
            }
            return $element.hasClass(className);
        },
        // Checks if a jQuery element has a specific data attribute.
        hasDataAttribute: function($element, attributeName) {
            if (!$element || $element.length === 0 || !attributeName) {
                return false;
            }
            return $element.attr(attributeName) !== undefined;
        }
    };

    // SelectionCoordinator manages the selection state of historical version rows.
    // It handles selecting one or two rows and highlighting the range between them.
    const SelectionCoordinator = {
        primarySelection: null, // Stores the first selected row (previously node1)
        secondarySelection: null, // Stores the second selected row (previously node2)
        highlightClassName: AppConfiguration.cssClasses.activeHighlight, // The CSS class for highlighting

        // Determines if 'candidateElementA' visually appears after 'candidateElementB' in the DOM.
        checkElementPositionAfter: function(candidateElementA, candidateElementB) {
            let isLocatedAfter = false;
            if (!candidateElementA || !candidateElementB || candidateElementA.length === 0 || candidateElementB.length === 0) {
                return false;
            }

            // Iterate through all previous siblings of A to see if B is among them.
            candidateElementA.fetchPreviousSiblings().each(function() {
                if (DomElementUtilities.areIdenticalElements($(this), candidateElementB)) {
                    isLocatedAfter = true;
                    return false; // Break from jQuery .each loop
                }
            });
            return isLocatedAfter;
        },

        // Establishes and highlights the range of elements between primarySelection and secondarySelection.
        applyRangeHighlighting: function() {
            // Guard clause: ensure both selections are present before attempting to highlight a range.
            if (!this.primarySelection || !this.secondarySelection) {
                return;
            }

            // First, clear all existing highlights to prepare for the new range.
            $(AppConfiguration.domSelectors.revisionHistoryTable)
                .find(AppConfiguration.domSelectors.activeSelectionCell)
                .removeCssClass(this.highlightClassName);

            // Ensure the two boundary elements are highlighted.
            this.primarySelection.addCssClass(this.highlightClassName);
            this.secondarySelection.addCssClass(this.highlightClassName);

            // If the selections are in reverse order, swap them internally.
            if (this.checkElementPositionAfter(this.primarySelection, this.secondarySelection)) {
                const temporaryNodeReference = this.primarySelection;
                this.primarySelection = this.secondarySelection;
                this.secondarySelection = temporaryNodeReference;
            }

            // Traverse from the first selection to the second, highlighting all intermediate elements.
            let currentElement = this.primarySelection.fetchNextSibling();
            while (currentElement && currentElement.length > 0) {
                currentElement.addCssClass(this.highlightClassName);
                if (DomElementUtilities.areIdenticalElements(currentElement, this.secondarySelection)) {
                    break; // Stop when the second selection is reached.
                }
                currentElement = currentElement.fetchNextSibling();
            }
        },

        // Handles the event when a version checkbox is toggled.
        processCheckboxToggle: function(triggeredCheckbox) {
            const $triggeredCheckbox = $(triggeredCheckbox);
            const $containingRow = $triggeredCheckbox.findAncestor('tr'); // Find the parent table row.

            // Guard clause: if the parent row cannot be determined, exit.
            if (!$containingRow || $containingRow.length === 0) {
                console.warn("SelectionCoordinator: Could not locate parent row for the toggled checkbox.");
                return;
            }

            const isCurrentlyMarked = $triggeredCheckbox.property('checked');

            if (!isCurrentlyMarked) {
                // If the checkbox was unchecked:
                // Remove highlight from rows that are no longer actively selected.
                $(AppConfiguration.domSelectors.historyTableRow + '.' + this.highlightClassName).each(function() {
                    const $currentRow = $(this);
                    // Only remove highlight if the row's checkbox is not checked.
                    if (!$currentRow.locate(AppConfiguration.domSelectors.selectionCheckboxCell + ' ' + AppConfiguration.domSelectors.versionMarkerInput).property('checked')) {
                        $currentRow.removeCssClass(SelectionCoordinator.highlightClassName);
                    }
                });

                // Update internal primary/secondary selection references.
                if (DomElementUtilities.areIdenticalElements($containingRow, this.primarySelection)) {
                    this.primarySelection = null;
                    if (this.secondarySelection) {
                        this.primarySelection = this.secondarySelection; // Promote secondary to primary if it exists.
                        this.secondarySelection = null;
                    }
                } else if (DomElementUtilities.areIdenticalElements($containingRow, this.secondarySelection)) {
                    this.secondarySelection = null;
                }
            } else {
                // If the checkbox was checked:
                if (!this.primarySelection) {
                    this.primarySelection = $containingRow;
                    this.primarySelection.addCssClass(this.highlightClassName);
                } else if (!this.secondarySelection) {
                    this.secondarySelection = $containingRow;
                    this.secondarySelection.addCssClass(this.highlightClassName);
                    this.applyRangeHighlighting(); // Automatically highlight the range.
                } else {
                    // If two items are already selected, prevent selecting a third.
                    $triggeredCheckbox.property('checked', false);
                    // console.info("Only two versions can be selected for comparison at a time.");
                }
            }
        }
    };

    // Extend jQuery's prototype with custom, semantically named methods for clarity and reusability.
    $.fn.extend({
        addCssClass: function(className) {
            return this.addClass(className);
        },
        removeCssClass: function(className) {
            return this.removeClass(className);
        },
        fetchNextSibling: function() {
            return this.next();
        },
        fetchPreviousSiblings: function() {
            return this.prevAll();
        },
        findAncestor: function(selector) {
            return this.closest(selector); // Using closest for more robust ancestor finding.
        },
        locate: function(selector) {
            return this.find(selector);
        },
        property: function(propName, value) {
            return arguments.length > 1 ? this.prop(propName, value) : this.prop(propName);
        },
        onUserInteraction: function(handler) {
            return this.on('click', handler);
        },
        triggerSubmission: function() {
            return this.submit();
        },
        countElements: function() {
            return this.length;
        }
    });

    // Main initialization function for the page's interactive elements.
    const setupPageInteractions = function() {
        // Apply custom font styling to header elements.
        FontStylizer.applyTextStyling(AppConfiguration.domSelectors.mainHeading, {
            visualColor: '-gradient(#999, 0.2=#777, 0.4=#444, 0.5=#222, 0.6=#333, 0.8=#555, #999)'
        });
        FontStylizer.applyTextStyling(AppConfiguration.domSelectors.subHeading);
        FontStylizer.applyTextStyling(AppConfiguration.domSelectors.navigationMenuItem, {
            onHover: {
                visualColor: '-gradient(black, white)'
            }
        });

        const $pageContentWrapper = $(AppConfiguration.domSelectors.contentAreaWrapper);

        // Conditional logic: only initialize history-related features if the page is a history view.
        if (DomElementUtilities.hasSpecificClass($pageContentWrapper, AppConfiguration.cssClasses.historyView)) {

            // Attach event listeners to all version selection checkboxes.
            $(AppConfiguration.domSelectors.revisionHistoryTable)
                .locate(AppConfiguration.domSelectors.versionMarkerInput)
                .each(function() {
                    const $currentCheckbox = $(this);

                    // Prevent attaching multiple event handlers if already initialized.
                    if (!DomElementUtilities.hasDataAttribute($currentCheckbox, AppConfiguration.dataAttributes.handlerInitialized)) {
                        $currentCheckbox.onUserInteraction(function() {
                            SelectionCoordinator.processCheckboxToggle($currentCheckbox);
                        });
                        $currentCheckbox.attr(AppConfiguration.dataAttributes.handlerInitialized, "true");
                    }

                    // On page load, if a checkbox is pre-checked, process its selection state.
                    if ($currentCheckbox.property('checked')) {
                        SelectionCoordinator.processCheckboxToggle($currentCheckbox);
                    }
                });

            // Set up the click handler for the "Compare Revisions" action link.
            const $compareRevisionsAction = $(AppConfiguration.domSelectors.compareRevisionsLink);
            if ($compareRevisionsAction.countElements() > 0) {
                $compareRevisionsAction.onUserInteraction(function(event) {
                    // Validation: Ensure exactly two versions are selected before allowing comparison.
                    if (!SelectionCoordinator.primarySelection || !SelectionCoordinator.secondarySelection) {
                        event.preventDefault(); // Stop the form submission.
                        // Optionally, display a user-friendly message.
                        // console.warn("Please select two versions to compare.");
                        return;
                    }
                    $(AppConfiguration.domSelectors.revisionComparisonForm).triggerSubmission();
                });
            }
        }
    };

    // Execute the page initialization logic once the DOM is fully loaded.
    $(document).on('DOMContentLoaded', setupPageInteractions);
    // As a fallback or if using older jQuery versions for compatibility:
    $(window).on('load', setupPageInteractions);

})(jQuery); // Pass jQuery as $ to the IIFE for scope and compatibility.