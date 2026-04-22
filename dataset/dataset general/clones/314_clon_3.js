const formBuilderApp = ((jqueryInstance) => {
    // A counter to assign unique IDs to newly added form controls.
    let controlElementCounter = 0;

    /**
     * Helper function to generate unique control IDs.
     * @returns {string} A unique ID string.
     */
    const getNextControlId = () => `control_field_${++controlElementCounter}`;

    /**
     * Manages the visibility of the design guides in the main panel.
     * Attaches an event listener to the guide toggle checkbox.
     */
    const initializeGuideToggle = () => {
        // Find the guides checkbox and attach a click event.
        jqueryInstance('.guides').on('click', function() {
            const selfElement = jqueryInstance(this); // Cache the element.
            const mainFormContainer = jqueryInstance('.main-panel form');

            // Apply or remove a CSS class based on the checkbox's checked state.
            if (selfElement.prop('checked')) {
                mainFormContainer.addClass('show-design-guides');
            } else {
                mainFormContainer.removeClass('show-design-guides');
            }
        });
    };

    /**
     * Dynamically generates the HTML markup for a new form control.
     * @param {string} controlType - The type of control (e.g., 'input', 'textarea').
     * @param {number} colWidth - The column width for the control (1-12).
     * @param {string} uniqueId - The unique ID for the control.
     * @returns {string} The HTML string for the control.
     */
    const generateControlHtml = (controlType, colWidth, uniqueId) => {
        let controlMarkup = '';
        const labelText = `Field ${controlElementCounter}`; // Use counter for default label.

        // Use template literals for cleaner HTML generation.
        switch (controlType) {
            case 'input':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <label for="${uniqueId}">${labelText}</label>
                        <input type="text" id="${uniqueId}" placeholder="Enter text" name="${uniqueId}" class="form-control-input">
                    </div>`;
                break;
            case 'textarea':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <label for="${uniqueId}">${labelText}</label>
                        <textarea id="${uniqueId}" placeholder="Enter multiple lines" rows="3" name="${uniqueId}" class="form-control-textarea"></textarea>
                    </div>`;
                break;
            case 'select':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <label for="${uniqueId}">${labelText}</label>
                        <select id="${uniqueId}" name="${uniqueId}" class="form-control-select">
                            <option value="option1">Choice One</option>
                            <option value="option2">Choice Two</option>
                        </select>
                    </div>`;
                break;
            case 'selectmultiple':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <label for="${uniqueId}">${labelText}</label>
                        <select id="${uniqueId}" name="${uniqueId}" multiple="multiple" class="form-control-select-multi">
                            <option value="m_option1">Multiple Choice One</option>
                            <option value="m_option2">Multiple Choice Two</option>
                        </select>
                    </div>`;
                break;
            case 'checklist':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="itemA" id="${uniqueId}_A">
                            <label class="form-check-label" for="${uniqueId}_A">Option A</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="itemB" id="${uniqueId}_B">
                            <label class="form-check-label" for="${uniqueId}_B">Option B</label>
                        </div>
                    </div>`;
                break;
            case 'radiolist':
                controlMarkup = `
                    <div class="col col-${colWidth} form-element-wrapper">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="${uniqueId}_group" value="radioA" id="${uniqueId}_radioA">
                            <label class="form-check-label" for="${uniqueId}_radioA">Radio Choice A</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="${uniqueId}_group" value="radioB" id="${uniqueId}_radioB">
                            <label class="form-check-label" for="${uniqueId}_radioB">Radio Choice B</label>
                        </div>
                    </div>`;
                break;
            default:
                console.warn(`Attempted to create an unsupported control type: ${controlType}`);
                return ''; // Return empty string for unknown types.
        }
        return controlMarkup;
    };

    /**
     * Sets up the functionality for adding new rows to the form.
     * When the 'Add Row' button is clicked, a new sortable row is appended.
     */
    const setupRowAdditionFeature = () => {
        jqueryInstance('.add-row-button').on('click', (evt) => {
            evt.preventDefault(); // Prevent default button action if it's a form submit.

            // Create a new row container.
            const dynamicRowContainer = jqueryInstance('<div class="row new-form-row"></div>');
            jqueryInstance('.main-panel form').append(dynamicRowContainer);

            // Configure sortable behavior for items within this new row.
            const rowSortableOptions = {
                accept: '.draggable-control', // Only accept elements with this class.
                connectWith: '.new-form-row', // Allow connection between rows.
                placeholder: 'placeholder-highlight', // CSS class for the placeholder.
                stop: (dragEvt, uiData) => {
                    // This callback fires when a draggable item is dropped into the sortable row.
                    const draggedItem = jqueryInstance(uiData.item[0]);
                    if (!draggedItem || draggedItem.length === 0) {
                        console.error('No item found in UI data after drop.');
                        return; // Guard clause.
                    }

                    const currentDefaultWidth = retrieveCurrentDefaultWidth();
                    const controlType = draggedItem.attr('data-control-type');
                    const newControlId = getNextControlId();

                    // Generate the HTML for the new control based on its type.
                    const newControlHtml = generateControlHtml(controlType, currentDefaultWidth, newControlId);

                    if (newControlHtml) {
                        draggedItem.replaceWith(newControlHtml); // Replace the draggable placeholder with actual control.
                    } else {
                        draggedItem.remove(); // Remove the item if generation failed.
                    }
                    refreshPropertyPanel(); // Update properties after adding a control.
                }
            };

            // Initialize sortable on the newly created row.
            dynamicRowContainer.sortable(rowSortableOptions);
        });
    };

    /**
     * Initializes draggable functionality for form control elements.
     * Allows controls to be dragged from a palette into sortable rows.
     */
    const prepareControlDraggables = () => {
        // Settings for jQuery UI Draggable.
        const draggableSettings = {
            revert: 'invalid', // Item reverts to original position if not dropped in a valid target.
            helper: 'clone',   // Drag a clone of the item, not the original.
            connectToSortable: '.new-form-row' // Allows dragging into elements with this class.
        };
        jqueryInstance('.draggable-control').draggable(draggableSettings);
    };

    /**
     * Configures the slider widget for setting the default column width.
     */
    const configureDefaultWidthSlider = () => {
        const sliderConfiguration = {
            min: 1,
            max: 12,
            value: 12, // Default width is 12 columns.
            slide: (evt, ui) => {
                // Update a display element if needed, though not strictly required by original.
                jqueryInstance('#default-width-display').text(ui.value);
            }
        };
        jqueryInstance('#default-width-slider').slider(sliderConfiguration);
    };

    /**
     * Retrieves the current value from the default width slider.
     * @returns {number} The current default column width.
     */
    const retrieveCurrentDefaultWidth = () => {
        return jqueryInstance('#default-width-slider').slider('value');
    };

    /**
     * Clears all selected states from form elements.
     */
    const clearAllSelections = () => {
        jqueryInstance('.col, .row').removeClass('is-selected');
    };

    /**
     * Activates selection management for form elements within the main panel.
     * Clicking on a column or row selects it and updates the properties panel.
     */
    const activateSelectionManagement = () => {
        const mainPanelForm = jqueryInstance('.main-panel form');
        const deleteActionButton = jqueryInstance('.delete-selected-item');

        // Event delegation for selecting columns and rows.
        mainPanelForm.on('click', '.col, .row', function(evt) {
            evt.stopPropagation(); // Prevent event bubbling to parent panel click handler.
            clearAllSelections(); // Deselect any previously selected elements.
            jqueryInstance(this).addClass('is-selected'); // Mark the clicked element as selected.
            deleteActionButton.prop('disabled', false); // Enable delete button.
            refreshPropertyPanel(); // Update the properties display.
        });

        // Click handler for the main panel to deselect everything.
        jqueryInstance('.main-panel').on('click', () => {
            clearAllSelections(); // Clear all selections.
            deleteActionButton.prop('disabled', true); // Disable delete button.
            refreshPropertyPanel(); // Clear the properties display.
        });
    };

    /**
     * Enables the deletion functionality for selected form elements.
     */
    const enableDeletionFunctionality = () => {
        jqueryInstance('.delete-selected-item').on('click', (evt) => {
            evt.preventDefault(); // Prevent default button action.
            const currentlySelected = jqueryInstance('.is-selected');

            // Only attempt deletion if an element is actually selected.
            if (currentlySelected.length > 0) {
                currentlySelected.remove(); // Remove the selected element(s).
                jqueryInstance('.delete-selected-item').prop('disabled', true); // Disable delete button.
                refreshPropertyPanel(); // Update the properties panel (likely to clear it).
            }
        });
    };

    /**
     * Helper to add a property input field to the properties panel.
     * @param {string} labelText - The label for the input.
     * @param {string} initialValue - The initial value of the input.
     * @param {string} inputId - The ID for the input element.
     * @param {function} changeHandler - Function to call on input change.
     */
    const addPropertyInput = (labelText, initialValue, inputId, changeHandler) => {
        const propertiesContainer = jqueryInstance('.properties-panel-body');
        const inputHtml = `
            <div class="property-group">
                <label for="${inputId}" class="property-label">${labelText}</label>
                <input type="text" id="${inputId}" value="${initialValue}" class="form-control property-input">
            </div>
        `;
        propertiesContainer.append(inputHtml);
        jqueryInstance(`#${inputId}`).on('input', changeHandler); // Use 'input' for real-time updates.
    };

    /**
     * Parses the column width from a given class string.
     * @param {string} classString - The full class string of an element.
     * @returns {number|null} The column width (1-12) or null if not found.
     */
    const parseColumnWidth = (classString) => {
        const classArray = classString.split(/\s+/);
        const columnClass = _.find(classArray, (cls) => cls.startsWith('col-') && cls.length > 4); // Check for 'col-X'
        if (columnClass) {
            const widthMatch = columnClass.match(/^col\-(\d+)$/);
            return widthMatch ? parseInt(widthMatch[1], 10) : null;
        }
        return null;
    };

    /**
     * Refreshes the properties panel based on the currently selected form element.
     * Displays editable properties like ID, Width, and Label.
     */
    const refreshPropertyPanel = () => {
        const selectedFormElement = jqueryInstance('.col.is-selected, .row.is-selected');
        const propertiesContainer = jqueryInstance('.properties-panel-body');
        const propertiesHeader = jqueryInstance('.properties-panel-header');

        // Clear previous properties.
        propertiesContainer.empty();

        if (selectedFormElement.length > 0) {
            const currentSelected = jqueryInstance(selectedFormElement[0]); // Take the first selected element.

            // --- Add Id Property Handler ---
            const currentId = currentSelected.find('label').attr('for') || currentSelected.attr('id') || `no-id-${Date.now()}`;
            addPropertyInput('Element ID', currentId, 'prop-element-id', function() {
                const newIdValue = jqueryInstance(this).val();
                // Update ID for label, input, textarea, select elements within the selected component.
                currentSelected.find('label').attr('for', newIdValue);
                currentSelected.find('input[type=text], textarea, select').attr({
                    id: newIdValue,
                    name: newIdValue
                });
            });

            // --- Add Width Property Handler (only for columns) ---
            if (currentSelected.hasClass('col')) {
                const cssClasses = currentSelected.attr('class') || '';
                let currentWidth = parseColumnWidth(cssClasses);

                if (currentWidth === null) {
                    // Fallback or default if no col-X class is found.
                    currentWidth = 12;
                    currentSelected.addClass(`col-${currentWidth}`);
                }

                addPropertyInput('Column Width (1-12)', String(currentWidth), 'prop-column-width', function() {
                    const newWidthValue = parseInt(jqueryInstance(this).val(), 10);
                    // Validate width input.
                    if (!isNaN(newWidthValue) && newWidthValue >= 1 && newWidthValue <= 12) {
                        // Remove all existing col-X classes.
                        _.each(_.range(1, 13), (colNum) => {
                            currentSelected.removeClass(`col-${colNum}`);
                        });
                        currentSelected.addClass(`col-${newWidthValue}`); // Add the new width class.
                    } else {
                        // Optionally provide user feedback for invalid input.
                        jqueryInstance(this).val(currentWidth); // Revert to last valid width.
                    }
                });
            }

            // --- Add Label Property Handler (only for elements with labels) ---
            const targetLabel = currentSelected.find('label').first();
            if (targetLabel.length > 0) {
                const currentLabelText = targetLabel.text();
                addPropertyInput('Display Label', currentLabelText, 'prop-display-label', function() {
                    const newLabelText = jqueryInstance(this).val();
                    targetLabel.text(newLabelText);
                });
            }

            propertiesHeader.show();
            propertiesContainer.show();
        } else {
            // Hide properties panel if nothing is selected.
            propertiesHeader.hide();
            propertiesContainer.hide();
        }
    };

    /**
     * Initializes all event handlers and components when the DOM is ready.
     */
    jqueryInstance(document).ready(() => {
        initializeGuideToggle();
        setupRowAdditionFeature();
        prepareControlDraggables();
        configureDefaultWidthSlider();
        activateSelectionManagement();
        enableDeletionFunctionality();
        refreshPropertyPanel(); // Initialize properties panel state.
    });

    // Public API for the form builder module.
    return {
        retrieveCurrentDefaultWidth: retrieveCurrentDefaultWidth // Expose the width getter.
    };

})(window.jQuery); // Pass jQuery instance to avoid conflicts.

/**
 * Exports the HTML structure of the generated form.
 * This is a standalone function, not part of the main module.
 * @returns {string} The inner HTML of the form.
 */
const exportFormStructure = () => {
    // A simple function to retrieve the current form HTML.
    // Consider cleaning up builder-specific classes before export if needed.
    return jqueryInstance('#form-preview-area').html();
};