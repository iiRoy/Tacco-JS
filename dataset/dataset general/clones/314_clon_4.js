(function(domManipulationHelper) {
    let componentSerialNumber = 0; // Unique serial for new form components

    // Execute setup functions once the DOM is fully loaded
    domManipulationHelper.onReady(function() {
        // Initialize all main interaction handlers
        toggleDisplayGuidelines();
        establishRowCreationMechanism();
        configureComponentDragBehavior();
        initializeDimensionControl();
        manageComponentSelection();
        enableComponentRemoval();
    });

    // Helper functions for DOM interaction
    const obtainElementById = (id) => document.getElementById(id);
    const selectSingleElement = (selector) => document.querySelector(selector);
    const selectAllMatchingElements = (selector) => document.querySelectorAll(selector);

    // Manages the visibility of layout guides
    const toggleDisplayGuidelines = function() {
        const visualAidsCheckbox = selectSingleElement('.visualAids'); // Original: .guides
        if (visualAidsCheckbox) {
            visualAidsCheckbox.addEventListener('change', function() {
                const mainFormLayout = selectSingleElement('.mainFormLayout'); // Original: .main-panel form
                if (mainFormLayout) {
                    mainFormLayout.classList.toggle('show-guides', this.checked);
                }
            });
        }
    };

    // Tracks the currently dragged element for reordering existing components
    let currentDraggedElement = null;

    // Establishes the mechanism for adding new rows and handling component drops
    const establishRowCreationMechanism = function() {
        const addRowButton = selectSingleElement('.addRowElement'); // Original: .add-row
        if (addRowButton) {
            addRowButton.addEventListener('click', function() {
                const newComponentRow = document.createElement('div');
                newComponentRow.className = 'componentRow selectableComponent'; // Original: .row
                newComponentRow.id = 'row_' + Date.now(); // Unique ID for D&D tracking
                newComponentRow.setAttribute('draggable', 'false'); // Rows are drop targets, not generally dragged themselves

                const mainFormLayout = selectSingleElement('.mainFormLayout');
                if (mainFormLayout) {
                    mainFormLayout.appendChild(newComponentRow);
                    activateRowDragAndDrop(newComponentRow); // Make the new row a droppable target
                }
            });
        }

        // Activate drag and drop for any existing rows on initial load
        selectAllMatchingElements('.componentRow').forEach(activateRowDragAndDrop);
    };

    // Attaches drag and drop listeners to a given row element
    const activateRowDragAndDrop = function(rowElement) {
        rowElement.addEventListener('dragover', function(e) {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = currentDraggedElement ? 'move' : 'copy'; // Indicate move for existing, copy for new

            // Visual feedback for reordering within the row
            if (currentDraggedElement && rowElement.contains(currentDraggedElement)) {
                const targetRect = rowElement.getBoundingClientRect();
                const pointerY = e.clientY - targetRect.top;
                const children = Array.from(rowElement.children).filter(child => child !== currentDraggedElement && child.classList.contains('formColumn'));
                let insertBeforeNode = null;
                for (let i = 0; i < children.length; i++) {
                    const childRect = children[i].getBoundingClientRect();
                    if (pointerY < (childRect.top + childRect.height / 2) - targetRect.top) {
                        insertBeforeNode = children[i];
                        break;
                    }
                }
                // Only update DOM if necessary to prevent reflows
                if (insertBeforeNode !== rowElement.nextSiblingMarker) {
                    rowElement.querySelectorAll('.drag-insertion-point').forEach(m => m.remove());
                    const marker = document.createElement('div');
                    marker.className = 'drag-insertion-point';
                    if (insertBeforeNode) {
                        rowElement.insertBefore(marker, insertBeforeNode);
                    } else {
                        rowElement.appendChild(marker);
                    }
                    rowElement.nextSiblingMarker = insertBeforeNode;
                }
            } else {
                rowElement.querySelectorAll('.drag-insertion-point').forEach(m => m.remove());
                rowElement.nextSiblingMarker = null;
            }
        });

        rowElement.addEventListener('dragleave', function() {
            rowElement.querySelectorAll('.drag-insertion-point').forEach(m => m.remove());
            rowElement.nextSiblingMarker = null;
        });

        rowElement.addEventListener('drop', function(e) {
            e.preventDefault();
            rowElement.querySelectorAll('.drag-insertion-point').forEach(m => m.remove());
            rowElement.nextSiblingMarker = null;

            const droppedComponentType = e.dataTransfer.getData('componentType'); // For new components from palette
            const draggedComponentId = e.dataTransfer.getData('componentId'); // For existing components being moved

            if (draggedComponentId && currentDraggedElement) { // Moving an existing component
                const targetColumn = e.target.closest('.formColumn');
                if (targetColumn && rowElement.contains(targetColumn)) {
                    const targetRect = targetColumn.getBoundingClientRect();
                    if (e.clientY < targetRect.top + targetRect.height / 2) {
                        rowElement.insertBefore(currentDraggedElement, targetColumn);
                    } else {
                        rowElement.insertBefore(currentDraggedElement, targetColumn.nextSibling);
                    }
                } else {
                    // Dropped directly on the row, append or prepend based on position
                    const childrenColumns = Array.from(rowElement.children).filter(child => child.classList.contains('formColumn'));
                    if (childrenColumns.length === 0) {
                        rowElement.appendChild(currentDraggedElement);
                    } else {
                        const targetRect = rowElement.getBoundingClientRect();
                        const pointerY = e.clientY - targetRect.top;
                        let insertBeforeNode = null;
                        for (let i = 0; i < childrenColumns.length; i++) {
                            const childRect = childrenColumns[i].getBoundingClientRect();
                            if (pointerY < (childRect.top + childRect.height / 2) - targetRect.top) {
                                insertBeforeNode = childrenColumns[i];
                                break;
                            }
                        }
                        if (insertBeforeNode) {
                            rowElement.insertBefore(currentDraggedElement, insertBeforeNode);
                        } else {
                            rowElement.appendChild(currentDraggedElement);
                        }
                    }
                }
                currentDraggedElement.classList.remove('hidden-drag-source');
                currentDraggedElement = null;
                refreshComponentAttributesDisplay(); // Update properties panel after move
            } else if (droppedComponentType) { // Dropping a new component from the palette
                componentSerialNumber++;
                const currentDimension = retrieveCurrentDimension();
                let generatedComponentFragment = '';

                // Map component types to HTML generation functions
                const componentGenerators = {
                    'input': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <label for="control_${serial}">Label ${serial}</label>
                            <input type="text" id="control_${serial}" placeholder="" name="control_${serial}">
                        </div>`,
                    'textarea': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <label for="control_${serial}">Label ${serial}</label>
                            <textarea id="control_${serial}" placeholder="" rows="3" name="control_${serial}"></textarea>
                        </div>`,
                    'select': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <label for="control_${serial}">Label ${serial}</label>
                            <select id="control_${serial}">
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                            </select>
                        </div>`,
                    'selectmultiple': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <label for="control_${serial}">Label ${serial}</label>
                            <select id="control_${serial}" multiple="multiple">
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                            </select>
                        </div>`,
                    'checklist': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" value="">
                                    Item A
                                </label>
                            </div>
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" value="">
                                    Item B
                                </label>
                            </div>
                        </div>`,
                    'radiolist': (serial, dimension) => `
                        <div class="formColumn col-${dimension} selectableComponent" id="component_${serial}" draggable="true">
                            <div class="radio">
                                <label>
                                    <input type="radio" value="">
                                    Option A
                                </label>
                            </div>
                            <div class="radio">
                                <label>
                                    <input type="radio" value="">
                                    Option B
                                </label>
                            </div>
                        </div>`
                };

                const generator = componentGenerators[droppedComponentType];
                if (generator) {
                    generatedComponentFragment = generator(componentSerialNumber, currentDimension);
                    const tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = generatedComponentFragment.trim();
                    const newElement = tempWrapper.firstElementChild;

                    // Insert the new element at the drop position
                    const targetColumn = e.target.closest('.formColumn');
                    if (targetColumn && rowElement.contains(targetColumn)) {
                        const targetRect = targetColumn.getBoundingClientRect();
                        if (e.clientY < targetRect.top + targetRect.height / 2) {
                            rowElement.insertBefore(newElement, targetColumn);
                        } else {
                            rowElement.insertBefore(newElement, targetColumn.nextSibling);
                        }
                    } else {
                        rowElement.appendChild(newElement); // Append if dropped directly on row
                    }

                    // Make the newly added component draggable for reordering
                    newElement.addEventListener('dragstart', handleComponentDragStart);
                    newElement.addEventListener('dragend', handleComponentDragEnd);
                }
            }
        });
    };

    // Configures palette components to be draggable
    const configureComponentDragBehavior = function() {
        const draggableComponents = selectAllMatchingElements('.draggableComponent'); // Original: .control
        draggableComponents.forEach(component => {
            component.setAttribute('draggable', 'true');
            component.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('componentType', this.dataset.componentType); // Original: data-control
                e.dataTransfer.effectAllowed = 'copy';
                this.classList.add('dragging-palette-item');
            });
            component.addEventListener('dragend', function() {
                this.classList.remove('dragging-palette-item');
            });
        });
    };

    // Handles drag start for existing form components (for reordering)
    const handleComponentDragStart = function(e) {
        currentDraggedElement = this;
        e.dataTransfer.setData('componentId', this.id);
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('hidden-drag-source'); // Temporarily hide the original element
    };

    // Handles drag end for existing form components
    const handleComponentDragEnd = function() {
        if (currentDraggedElement) {
            currentDraggedElement.classList.remove('hidden-drag-source');
        }
        currentDraggedElement = null;
        selectAllMatchingElements('.drag-insertion-point').forEach(m => m.remove());
    };

    // Initializes the width control slider
    const initializeDimensionControl = function() {
        const widthAdjustmentSlider = obtainElementById('widthAdjustmentSlider'); // Original: #default-width
        if (widthAdjustmentSlider) {
            // Using a native range input as a functional equivalent for the jQuery UI slider
            widthAdjustmentSlider.setAttribute('min', 1);
            widthAdjustmentSlider.setAttribute('max', 12);
            widthAdjustmentSlider.setAttribute('value', 12);
        }
    };

    // Retrieves the current value from the width control slider
    const retrieveCurrentDimension = function() {
        const widthAdjustmentSlider = obtainElementById('widthAdjustmentSlider');
        return widthAdjustmentSlider ? parseInt(widthAdjustmentSlider.value, 10) : 12;
    };

    // Manages the selection and deselection of form components and rows
    const manageComponentSelection = function() {
        const mainPanel = selectSingleElement('.mainPanel'); // Original: .main-panel
        const mainFormLayout = selectSingleElement('.mainFormLayout');

        if (mainFormLayout) {
            mainFormLayout.addEventListener('click', function(e) {
                const clickedElement = e.target.closest('.formColumn, .componentRow'); // Original: .col, .row

                // Deselect all other selectable elements
                selectAllMatchingElements('.selectableComponent').forEach(el => el.classList.remove('currentlySelected')); // Original: .selected
                
                if (clickedElement) {
                    clickedElement.classList.add('currentlySelected');
                    selectSingleElement('.deletionButton').disabled = false; // Original: .delete-item
                } else {
                    selectSingleElement('.deletionButton').disabled = true;
                }
                refreshComponentAttributesDisplay();
                e.stopPropagation(); // Prevent the mainPanel handler from deselecting
            });
        }

        if (mainPanel) {
            mainPanel.addEventListener('click', function() {
                // Deselect everything if clicking outside a component/row
                selectAllMatchingElements('.selectableComponent').forEach(el => el.classList.remove('currentlySelected'));
                selectSingleElement('.deletionButton').disabled = true;
                refreshComponentAttributesDisplay();
            });
        }
    };

    // Enables the functionality to remove selected components
    const enableComponentRemoval = function() {
        const deletionButton = selectSingleElement('.deletionButton'); // Original: .delete-item
        if (deletionButton) {
            deletionButton.addEventListener('click', function() {
                const activeComponent = selectSingleElement('.selectableComponent.currentlySelected');
                if (activeComponent) {
                    activeComponent.remove();
                }
                refreshComponentAttributesDisplay(); // Update properties panel after removal
            });
        }
    };

    // Updates the display of properties for the currently selected component
    const refreshComponentAttributesDisplay = function() {
        const activeComponent = selectSingleElement('.formColumn.currentlySelected'); // Original: .col.selected
        const attributesPanel = selectSingleElement('.attributesPanel'); // Original: .properties
        const attributesPanelTitle = selectSingleElement('.attributesPanelTitle'); // Original: .properties-title

        if (attributesPanel) {
            if (activeComponent) {
                attributesPanel.innerHTML = ''; // Clear previous properties

                // Identifier (ID) Handler
                const componentLabel = activeComponent.querySelector('label');
                const currentId = componentLabel ? componentLabel.getAttribute('for') : '';
                
                const idLabel = document.createElement('label');
                idLabel.textContent = 'Identifier';
                attributesPanel.appendChild(idLabel);

                const idInput = document.createElement('input');
                idInput.type = 'text';
                idInput.value = currentId;
                idInput.id = 'attributeIdInput'; // Original: #properties-id
                attributesPanel.appendChild(idInput);

                idInput.addEventListener('input', function() {
                    const inputValue = this.value;
                    if (componentLabel) componentLabel.setAttribute('for', inputValue);
                    const inputOrTextareaOrSelect = activeComponent.querySelector('input[type=text], textarea, select');
                    if (inputOrTextareaOrSelect) {
                        inputOrTextareaOrSelect.id = inputValue;
                        inputOrTextareaOrSelect.name = inputValue;
                    }
                });

                // Component Width Handler
                const elementClasses = Array.from(activeComponent.classList);
                const dimensionClassMatch = elementClasses.find(cls => cls.match(/^col\-[0-9]+$/));
                let currentDimension = 12; // Default width
                if (dimensionClassMatch) {
                    currentDimension = parseInt(dimensionClassMatch.match(/^col\-([0-9]+)$/)[1], 10);
                }

                const widthLabel = document.createElement('label');
                widthLabel.textContent = 'Component Width (1-12)';
                attributesPanel.appendChild(widthLabel);

                const widthInput = document.createElement('input');
                widthInput.type = 'text';
                widthInput.value = currentDimension;
                widthInput.id = 'attributeWidthInput'; // Original: #properties-width
                attributesPanel.appendChild(widthInput);

                widthInput.addEventListener('input', function() {
                    let inputValue = parseInt(this.value, 10);
                    if (!isNaN(inputValue) && inputValue >= 1 && inputValue <= 12) {
                        for (let i = 1; i <= 12; i++) { // Replaces Lodash _.each(_.range(1,13))
                            activeComponent.classList.remove('col-' + i);
                        }
                        activeComponent.classList.add('col-' + inputValue);
                    }
                });

                // Display Label Handler
                const labelText = componentLabel ? componentLabel.textContent : '';
                
                const labelLabel = document.createElement('label');
                labelLabel.textContent = 'Display Label';
                attributesPanel.appendChild(labelLabel);

                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = labelText;
                labelInput.id = 'attributeLabelInput'; // Original: #properties-label
                attributesPanel.appendChild(labelInput);

                labelInput.addEventListener('input', function() {
                    if (componentLabel) {
                        componentLabel.textContent = this.value;
                    }
                });

                attributesPanel.style.display = 'block';
                if (attributesPanelTitle) attributesPanelTitle.style.display = 'block';

            } else {
                attributesPanel.style.display = 'none';
                if (attributesPanelTitle) attributesPanelTitle.style.display = 'none';
            }
        }
    };

    // Expose the retrieveCurrentDimension function globally if needed
    domManipulationHelper.retrieveCurrentDimension = retrieveCurrentDimension;

    // A utility object to mimic jQuery's ready function and encapsulate global scope exposure
    const utilityFacade = {
        onReady: function(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        },
        retrieveCurrentDimension: null // Will be populated by the main logic
    };

    return utilityFacade;

})(window.domManipulationHelper = window.domManipulationHelper || {}); // Use a unique global object name

// Global function equivalent to the original formhtml
function fetchFormStructure() {
    const formElement = document.getElementById('form');
    return formElement ? formElement.innerHTML : '';
}