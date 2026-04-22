(function(globalContext) {
    "use strict";

    // Internal utility to compute an element's height based on its box model,
    // reflecting how jQuery's .height() and .innerHeight() behave.
    function obtainAdjustedDimension(targetElement) {
        const calculatedStyle = globalContext.getComputedStyle(targetElement);
        const currentBoxModel = calculatedStyle.getPropertyValue('box-sizing') || calculatedStyle.getPropertyValue('-moz-box-sizing');

        if (currentBoxModel === 'border-box') {
            // For 'border-box', jQuery's .innerHeight() (content + padding) is equivalent to clientHeight.
            return targetElement.clientHeight;
        } else {
            // For 'content-box', jQuery's .height() (content only)
            // clientHeight gives content + padding, so we subtract padding.
            const padTop = parseFloat(calculatedStyle.paddingTop);
            const padBottom = parseFloat(calculatedStyle.paddingBottom);
            return targetElement.clientHeight - padTop - padBottom;
        }
    }

    // Aligns the heights of a collection of elements to the tallest amongst them.
    function normalizeSectionHeights(elementList) {
        if (!elementList || elementList.length === 0) return elementList;

        // Temporarily reset heights to 'auto' to ensure natural height measurement.
        elementList.forEach(el => el.style.height = 'auto');

        // Determine the maximum height required.
        const highestPoint = elementList.reduce((maxH, currentEl) => {
            const currentH = obtainAdjustedDimension(currentEl);
            return Math.max(maxH, currentH);
        }, 0);

        // Apply the maximum height to all elements.
        elementList.forEach(el => el.style.height = `${highestPoint}px`);
        return elementList;
    }

    // Distributes a set of elements into rows based on a column count,
    // then applies `normalizeSectionHeights` to each row.
    function arrangeHomogeneousGrid(visualUnits, unitCountPerRow) {
        if (!visualUnits || visualUnits.length === 0 || unitCountPerRow <= 0) return visualUnits;

        // Filter for only visible elements.
        const visibleUnits = visualUnits.filter(unit => {
            const style = globalContext.getComputedStyle(unit);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (visibleUnits.length === 0) return visualUnits;

        // Reset heights to 'auto' for accurate measurement before grouping.
        visibleUnits.forEach(unit => unit.style.height = 'auto');

        // Iterate through visible elements, processing them in chunks (rows).
        for (let i = 0; i < visibleUnits.length; i += unitCountPerRow) {
            const currentGroup = visibleUnits.slice(i, i + unitCountPerRow);
            normalizeSectionHeights(currentGroup);
        }
        return visualUnits;
    }

    // Ascertains the number of columns in a grid by analyzing elements' vertical offsets.
    function determineLayoutSpan(structuralUnits) {
        if (!structuralUnits || structuralUnits.length === 0) return 0;

        const activeUnits = structuralUnits.filter(unit => {
            const style = globalContext.getComputedStyle(unit);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

        if (activeUnits.length === 0) return 0;

        const initialOffset = activeUnits[0].offsetTop;
        let countedSpan = 0;

        // Count how many elements share the same top offset as the first.
        for (let i = 0; i < activeUnits.length; i++) {
            if (activeUnits[i].offsetTop === initialOffset) {
                countedSpan++;
            } else {
                break; // A new row has commenced.
            }
        }
        return countedSpan;
    }

    // Registry to keep track of active synchronization instances for cleanup.
    const managedGridInstances = new Map();
    let instanceCountSeed = 0; // Used to generate unique identifiers.

    /**
     * Establishes dynamic height synchronization for a specified set of elements.
     * This process will automatically adjust element heights within their rows
     * and re-evaluate on window resize and load events.
     *
     * @param {string} selectionQuery - A CSS selector string targeting the elements to manage.
     * @returns {object} An interface with a `ceaseSynchronization` method to halt the process.
     */
    globalContext.initializeHeightSynchronization = function(selectionQuery) {
        const uniqueInstanceId = `dynamicGridSync_${instanceCountSeed++}`;
        const targetElements = Array.from(globalContext.document.querySelectorAll(selectionQuery));

        if (targetElements.length === 0) {
            // If no elements are found, return a inert control object.
            return {
                ceaseSynchronization: () => {}
            };
        }

        // The central function for layout harmonization.
        const conductLayoutHarmonization = () => {
            const currentSpan = determineLayoutSpan(targetElements);
            if (currentSpan > 0) {
                arrangeHomogeneousGrid(targetElements, currentSpan);
            }
        };

        // Event listener callback, debounced with requestAnimationFrame for efficiency.
        const resizeLoadHandler = () => {
            globalContext.requestAnimationFrame(conductLayoutHarmonization);
        };

        // Function to dismantle the synchronization instance.
        const cleanupFunction = () => {
            globalContext.removeEventListener('resize', resizeLoadHandler);
            globalContext.removeEventListener('load', resizeLoadHandler);
            targetElements.forEach(el => el.style.height = 'auto'); // Reset heights.
            managedGridInstances.delete(uniqueInstanceId); // Remove from registry.
        };

        // Attach event listeners to the window.
        globalContext.addEventListener('resize', resizeLoadHandler);
        globalContext.addEventListener('load', resizeLoadHandler);

        // Execute initial harmonization.
        resizeLoadHandler();

        // Store the instance's control object in the registry.
        managedGridInstances.set(uniqueInstanceId, {
            elements: targetElements,
            handler: resizeLoadHandler,
            ceaseSynchronization: cleanupFunction
        });

        // Return the control object to the caller.
        return {
            ceaseSynchronization: cleanupFunction,
            getIdentifier: () => uniqueInstanceId // Provide the unique ID if needed for external management.
        };
    };

    /**
     * Terminates an active dynamic height synchronization instance identified by its unique ID.
     *
     * @param {string} identifier - The unique identifier obtained from `initializeHeightSynchronization.getIdentifier()`.
     */
    globalContext.ceaseHeightSynchronization = function(identifier) {
        const instanceRecord = managedGridInstances.get(identifier);
        if (instanceRecord && typeof instanceRecord.ceaseSynchronization === 'function') {
            instanceRecord.ceaseSynchronization();
        }
    };

})(window);