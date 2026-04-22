document.addEventListener('DOMContentLoaded', () => {

    // Utility functions to select elements
    const accessElement = (selector) => document.querySelector(selector);
    const accessAllElements = (selector) => Array.from(document.querySelectorAll(selector));

    // References to key UI components
    const canvasWidthEntry = accessElement('#nav-width');
    const itemDimensionContainer = accessElement('.inputs');
    const addDimensionItemBtn = accessElement('#add');
    const removeDimensionItemBtn = accessElement('#remove');
    const resetDimensionsBtn = accessElement('#reset');
    const executeCalculationsBtn = accessElement('input[type=button]');
    const notificationArea = accessElement('#alerts-zone'); 
    const outputResultsZone = accessElement('#results-wrapper');
    const availablePixelsDisplay = accessElement('#pixels-remaining span');
    const finalPercentageDisplay = accessElement('#total-percent-used span');

    // Determines the current count of dimension items
    const retrieveCurrentItemCount = () => accessAllElements('.dimension-unit').length;

    // Shows a message to the user in the designated notification area
    const presentUserMessage = (notificationText) => {
        if (notificationArea) {
            notificationArea.innerHTML = `<div id="user-notification">${notificationText}</div>`;
        }
    };

    // Clears any active user notifications
    const dismissUserMessage = () => {
        const activeNotification = accessElement('#user-notification');
        if (activeNotification) {
            activeNotification.remove();
        }
    };

    // Safely extracts a floating-point number from an input element's value
    const extractNumericalValue = (inputElement) => Number.parseFloat(inputElement.value) || 0;

    // Computes the total sum of all current item dimension values
    const aggregateItemDimensions = () => {
        return accessAllElements('.dimension-field').reduce((total, fieldInput) => {
            return total + extractNumericalValue(fieldInput);
        }, 0);
    };

    // Updates the display showing the remaining pixel width and handles overflow alerts
    const updateRemainingPixelsView = () => {
        const overallCanvasWidth = extractNumericalValue(canvasWidthEntry);
        const currentItemsTotal = aggregateItemDimensions();
        const pixelsRemaining = overallCanvasWidth - currentItemsTotal;
        
        if (availablePixelsDisplay) {
            availablePixelsDisplay.textContent = pixelsRemaining;
        }

        // Trigger alert if total item dimensions exceed canvas width
        if (currentItemsTotal > overallCanvasWidth) {
            presentUserMessage('Combined item dimensions exceed the total canvas width.');
            // Clear the most recently added field if it caused the overflow, mimicking original behavior
            const lastDimensionField = accessAllElements('.dimension-field').slice(-1)[0];
            if (lastDimensionField) {
                lastDimensionField.value = '';
            }
        } else {
            dismissUserMessage();
        }
    };

    // Generates and appends a new dimension input field to the container
    const constructNewDimensionField = () => {
        const count = retrieveCurrentItemCount();
        const nextSequenceNumber = count + 1;
        const newFieldMarkup = `
            <div class="dimension-unit">
                <label for="dimension-item-${nextSequenceNumber}">${nextSequenceNumber}</label>
                <input type="text" class="dimension-field" name="item-sizes[]" id="dimension-item-${nextSequenceNumber}" placeholder="Item dimension" value="" pattern="[0-9]*">
                <span class="unit-identifier">unit</span>
            </div>
        `;
        
        itemDimensionContainer.insertAdjacentHTML('beforeend', newFieldMarkup);
        accessElement(`#dimension-item-${nextSequenceNumber}`).focus();
    };

    // --- Event Listener Setup ---

    // Update available pixels when the main canvas width is typed
    canvasWidthEntry.addEventListener('keyup', () => {
        const currentCanvasWidth = extractNumericalValue(canvasWidthEntry);
        if (availablePixelsDisplay) {
            availablePixelsDisplay.textContent = currentCanvasWidth;
        }
    });

    // Delegate keyup events for individual dimension fields to update remaining pixels
    itemDimensionContainer.addEventListener('keyup', (event) => {
        if (event.target.matches('.dimension-field')) {
            updateRemainingPixelsView();
        }
    });

    // Handler for adding a new dimension item
    addDimensionItemBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const overallCanvasWidth = extractNumericalValue(canvasWidthEntry);
        const currentItemsTotal = aggregateItemDimensions();

        if (currentItemsTotal > overallCanvasWidth) {
            presentUserMessage('Total items exceed canvas width. Please adjust, or the last item will be cleared.');
            const lastDimensionField = accessAllElements('.dimension-field').slice(-1)[0];
            if (lastDimensionField) {
                lastDimensionField.value = '';
            }
        } else {
            dismissUserMessage();
            constructNewDimensionField();
            updateRemainingPixelsView();
        }
    });

    // Handler for removing the last dimension item
    removeDimensionItemBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const count = retrieveCurrentItemCount();
        if (count > 1) { // Retain at least one item, matching original logic
            const lastDimensionUnit = accessAllElements('.dimension-unit').slice(-1)[0];
            if (lastDimensionUnit) {
                lastDimensionUnit.remove();
            }
        }
        dismissUserMessage();
        const calculationOutput = accessElement('#calculation-output');
        if (calculationOutput) calculationOutput.remove();
        updateRemainingPixelsView();
    });

    // Handler for resetting all dimension items except the first one
    resetDimensionsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        let count = retrieveCurrentItemCount();
        while (count > 1) { // Remove items until only one remains, matching original logic
            const lastDimensionUnit = accessAllElements('.dimension-unit').slice(-1)[0];
            if (lastDimensionUnit) {
                lastDimensionUnit.remove();
            }
            count--;
        }
        accessAllElements('.dimension-field').forEach(field => field.value = ''); // Clear values of remaining fields
        dismissUserMessage();
        const calculationOutput = accessElement('#calculation-output');
        if (calculationOutput) calculationOutput.remove();
        updateRemainingPixelsView();
    });

    // Handler for executing the final percentage calculations
    executeCalculationsBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const overallCanvasWidth = extractNumericalValue(canvasWidthEntry);
        const allDimensionFields = accessAllElements('.dimension-field');
        const currentItemsTotal = aggregateItemDimensions();

        // Clear previous results and notifications
        dismissUserMessage();
        const existingOutput = accessElement('#calculation-output');
        if (existingOutput) existingOutput.remove();

        if (allDimensionFields.length === 0 || overallCanvasWidth === 0) {
            presentUserMessage('Please input values to proceed with calculations.');
            return;
        }

        if (currentItemsTotal > overallCanvasWidth) {
            presentUserMessage('Total item dimensions exceed canvas width. Please adjust, or the last item will be cleared.');
            const lastDimensionField = allDimensionFields.slice(-1)[0];
            if (lastDimensionField) {
                lastDimensionField.value = '';
            }
            return;
        }

        let totalCalculatedPercentage = 0;
        const individualItemPercentages = allDimensionFields.map(field => {
            const itemValue = extractNumericalValue(field);
            const itemPercentage = (itemValue / overallCanvasWidth) * 100;
            totalCalculatedPercentage += itemPercentage;
            return itemPercentage.toFixed(2) + '%';
        });

        if (finalPercentageDisplay) {
            finalPercentageDisplay.textContent = totalCalculatedPercentage.toFixed(2) + '%';
        }

        // Display individual percentages
        if (outputResultsZone) {
            outputResultsZone.insertAdjacentHTML('beforeend', `<div id="calculation-output">${individualItemPercentages.join('<br>')}</div>`);
        }
    });

    // Initial page load setup
    // Ensure the initial available pixels display reflects the canvas width
    if (canvasWidthEntry && availablePixelsDisplay) {
        availablePixelsDisplay.textContent = extractNumericalValue(canvasWidthEntry);
    }
    // Perform an initial update to catch any pre-filled values
    updateRemainingPixelsView();
});